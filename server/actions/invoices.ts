"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/drizzle";
import { invoices, appointments, customers, services, tenants } from "@/lib/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentTenant } from "@/server/queries/tenants";
import { createServiceClient } from "@/lib/supabase/server";
import { invoiceSchema, paymentSchema } from "@/features/invoices/schemas";
import type { InvoiceStatus } from "@/types";

export async function createInvoice(formData: FormData) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "Non autorisé" };

  const raw = {
    customerId: formData.get("customerId") as string,
    appointmentId: (formData.get("appointmentId") as string) || undefined,
    amount: Number(formData.get("amount")),
  };

  const parsed = invoiceSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const [invoice] = await db
    .insert(invoices)
    .values({
      tenantId: tenant.id,
      customerId: parsed.data.customerId,
      appointmentId: parsed.data.appointmentId || null,
      amount: parsed.data.amount,
      status: "draft",
    })
    .returning({ id: invoices.id });

  revalidatePath("/dashboard/factures");
  return { success: true, id: invoice.id };
}

export async function createInvoiceFromAppointment(
  tenantId: string,
  appointmentId: string
) {
  const [appt] = await db
    .select({
      customerId: appointments.customerId,
      serviceId: appointments.serviceId,
    })
    .from(appointments)
    .where(and(eq(appointments.id, appointmentId), eq(appointments.tenantId, tenantId)))
    .limit(1);

  if (!appt) return null;

  let amount = 0;
  if (appt.serviceId) {
    const [svc] = await db
      .select({ price: services.price })
      .from(services)
      .where(eq(services.id, appt.serviceId))
      .limit(1);
    amount = svc?.price ?? 0;
  }

  const [invoice] = await db
    .insert(invoices)
    .values({
      tenantId,
      customerId: appt.customerId,
      appointmentId,
      amount,
      status: "draft",
    })
    .returning({ id: invoices.id });

  return invoice.id;
}

export async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "Non autorisé" };

  await db
    .update(invoices)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenant.id)));

  revalidatePath("/dashboard/factures");
  revalidatePath(`/dashboard/factures/${invoiceId}`);
  return { success: true };
}

export async function markInvoicePaid(invoiceId: string, formData: FormData) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "Non autorisé" };

  const raw = {
    paymentMethod: formData.get("paymentMethod") as string,
    paidAt: formData.get("paidAt") as string,
    paymentReference: (formData.get("paymentReference") as string) || undefined,
  };

  const parsed = paymentSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(invoices)
    .set({
      status: "paid",
      paymentMethod: parsed.data.paymentMethod as "cash" | "airtel_money" | "moov_money" | "virement" | "cheque",
      paidAt: new Date(parsed.data.paidAt),
      paymentReference: parsed.data.paymentReference ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenant.id)));

  revalidatePath("/dashboard/factures");
  revalidatePath(`/dashboard/factures/${invoiceId}`);
  return { success: true };
}

export async function markInvoiceSent(invoiceId: string) {
  return updateInvoiceStatus(invoiceId, "sent");
}

export async function generateInvoicePdf(invoiceId: string) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "Non autorisé" };

  const [invoice] = await db
    .select({
      id: invoices.id,
      tenantId: invoices.tenantId,
      amount: invoices.amount,
      status: invoices.status,
      createdAt: invoices.createdAt,
      customerName: customers.fullName,
      customerPhone: customers.phone,
      customerEmail: customers.email,
      customerAddress: customers.address,
      serviceName: services.name,
      serviceDescription: services.description,
      scheduledAt: appointments.scheduledAt,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .leftJoin(appointments, eq(invoices.appointmentId, appointments.id))
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenant.id)))
    .limit(1);

  if (!invoice) return { error: "Facture introuvable" };

  // Dynamic import to avoid SSR issues with @react-pdf/renderer
  const { renderToBuffer } = await import("@react-pdf/renderer");
  const React = await import("react");
  const { InvoicePDF } = await import("@/features/invoices/invoice-pdf");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.default.createElement(InvoicePDF, {
    invoice,
    tenantName: tenant.name,
    tenantPhone: tenant.whatsappNumber,
  }) as any;
  const buffer = await renderToBuffer(element);

  const supabase = createServiceClient();
  const path = `invoices/${tenant.id}/${invoiceId}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(path, buffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) return { error: "Erreur lors de la génération du PDF" };

  const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);

  await db
    .update(invoices)
    .set({ pdfUrl: urlData.publicUrl, updatedAt: new Date() })
    .where(eq(invoices.id, invoiceId));

  revalidatePath(`/dashboard/factures/${invoiceId}`);
  return { success: true, url: urlData.publicUrl };
}
