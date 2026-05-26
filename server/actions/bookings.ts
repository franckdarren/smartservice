"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/drizzle";
import { customers, appointments, services, tenants } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { publicBookingSchema } from "@/features/bookings/schemas";
import { notifyNewBooking, sendBookingConfirmation } from "@/lib/whatsapp";

export async function createPublicBooking(slug: string, formData: FormData) {
  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.slug, slug))
    .limit(1);

  if (!tenant) return { error: "Prestataire introuvable" };

  const raw = {
    fullName: formData.get("fullName") as string,
    phone: formData.get("phone") as string,
    email: (formData.get("email") as string) || undefined,
    serviceId: (formData.get("serviceId") as string) || undefined,
    preferredDate: formData.get("preferredDate") as string,
    preferredTime: formData.get("preferredTime") as string,
    message: (formData.get("message") as string) || undefined,
  };

  const parsed = publicBookingSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Chercher ou créer le client
  const existingCustomers = await db
    .select()
    .from(customers)
    .where(eq(customers.phone, parsed.data.phone))
    .limit(1);

  let customerId: string;

  if (existingCustomers.length > 0 && existingCustomers[0].tenantId === tenant.id) {
    customerId = existingCustomers[0].id;
  } else {
    const [newCustomer] = await db
      .insert(customers)
      .values({
        tenantId: tenant.id,
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
      })
      .returning();
    customerId = newCustomer.id;
  }

  // Créer le rendez-vous avec statut pending
  const scheduledAt = new Date(
    `${parsed.data.preferredDate}T${parsed.data.preferredTime}:00`
  );

  await db.insert(appointments).values({
    tenantId: tenant.id,
    customerId,
    serviceId: parsed.data.serviceId || null,
    scheduledAt,
    status: "pending",
    isUrgent: false,
    notes: parsed.data.message || null,
  });

  // Notifications WhatsApp asynchrones (sans bloquer la redirection)
  let serviceName = "Prestation";
  if (parsed.data.serviceId) {
    const [svc] = await db
      .select({ name: services.name })
      .from(services)
      .where(eq(services.id, parsed.data.serviceId))
      .limit(1);
    if (svc) serviceName = svc.name;
  }

  if (tenant.whatsappNumber) {
    notifyNewBooking(tenant.whatsappNumber, tenant.name, parsed.data.fullName, serviceName, scheduledAt).catch(() => null);
  }

  if (parsed.data.phone) {
    sendBookingConfirmation(parsed.data.phone, tenant.name, serviceName, scheduledAt).catch(() => null);
  }

  redirect(`/${slug}/confirmation`);
}
