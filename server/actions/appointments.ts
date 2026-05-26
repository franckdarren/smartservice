"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/drizzle";
import { appointments } from "@/lib/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentTenant } from "@/server/queries/tenants";
import { appointmentSchema } from "@/features/appointments/schemas";
import { createInvoiceFromAppointment } from "@/server/actions/invoices";
import { sendWhatsAppNotification } from "@/lib/whatsapp";
import type { AppointmentStatus } from "@/types";

export async function createAppointment(formData: FormData) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "Non autorisé" };

  const isUrgent = formData.get("isUrgent") === "true";

  const raw = {
    customerId: formData.get("customerId") as string,
    serviceId: (formData.get("serviceId") as string) || undefined,
    scheduledAt: formData.get("scheduledAt") as string,
    status: (formData.get("status") as AppointmentStatus) || "pending",
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = appointmentSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db.insert(appointments).values({
    tenantId: tenant.id,
    customerId: parsed.data.customerId,
    serviceId: parsed.data.serviceId || null,
    scheduledAt: new Date(parsed.data.scheduledAt),
    status: parsed.data.status,
    isUrgent,
    notes: parsed.data.notes || null,
  });

  revalidatePath("/dashboard/rendez-vous");
  return { success: true };
}

export async function updateAppointment(appointmentId: string, formData: FormData) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "Non autorisé" };

  const isUrgent = formData.get("isUrgent") === "true";

  const raw = {
    customerId: formData.get("customerId") as string,
    serviceId: (formData.get("serviceId") as string) || undefined,
    scheduledAt: formData.get("scheduledAt") as string,
    status: (formData.get("status") as AppointmentStatus) || "pending",
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = appointmentSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(appointments)
    .set({
      customerId: parsed.data.customerId,
      serviceId: parsed.data.serviceId || null,
      scheduledAt: new Date(parsed.data.scheduledAt),
      status: parsed.data.status,
      isUrgent,
      notes: parsed.data.notes || null,
      updatedAt: new Date(),
    })
    .where(and(eq(appointments.id, appointmentId), eq(appointments.tenantId, tenant.id)));

  revalidatePath("/dashboard/rendez-vous");
  return { success: true };
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "Non autorisé" };

  const updateData: Record<string, unknown> = { status, updatedAt: new Date() };

  if (status === "done") {
    const { randomUUID } = await import("crypto");
    updateData.reviewToken = randomUUID();
  }

  await db
    .update(appointments)
    .set(updateData)
    .where(and(eq(appointments.id, appointmentId), eq(appointments.tenantId, tenant.id)));

  if (status === "done") {
    await createInvoiceFromAppointment(tenant.id, appointmentId);

    const [appt] = await db
      .select({ reviewToken: appointments.reviewToken })
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (appt?.reviewToken && tenant.whatsappNumber) {
      const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL?.replace("app.", "")}/avis/${appt.reviewToken}`;
      await sendWhatsAppNotification(
        tenant.whatsappNumber,
        `Bonjour ! Merci d'avoir fait appel à ${tenant.name}. Donnez votre avis ici : ${reviewUrl}`
      ).catch(() => null);
    }
  }

  revalidatePath("/dashboard/rendez-vous");
  revalidatePath("/dashboard/factures");
  return { success: true };
}

export async function cancelAppointment(appointmentId: string) {
  return updateAppointmentStatus(appointmentId, "cancelled");
}
