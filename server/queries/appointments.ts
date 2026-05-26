import { db } from "@/lib/drizzle";
import { appointments, customers, services } from "@/lib/drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export async function getAppointments(tenantId: string) {
  return db
    .select({
      id: appointments.id,
      tenantId: appointments.tenantId,
      customerId: appointments.customerId,
      serviceId: appointments.serviceId,
      scheduledAt: appointments.scheduledAt,
      status: appointments.status,
      isUrgent: appointments.isUrgent,
      notes: appointments.notes,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      customerName: customers.fullName,
      customerPhone: customers.phone,
      serviceName: services.name,
    })
    .from(appointments)
    .leftJoin(customers, eq(appointments.customerId, customers.id))
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .where(eq(appointments.tenantId, tenantId))
    .orderBy(desc(appointments.scheduledAt));
}

export async function getAppointmentById(tenantId: string, appointmentId: string) {
  const [appt] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, appointmentId))
    .limit(1);

  if (!appt || appt.tenantId !== tenantId) return null;
  return appt;
}

export async function getAppointmentsByDate(tenantId: string, date: Date) {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 86400000 - 1);

  return db
    .select({
      id: appointments.id,
      scheduledAt: appointments.scheduledAt,
      status: appointments.status,
      isUrgent: appointments.isUrgent,
      notes: appointments.notes,
      customerName: customers.fullName,
      serviceName: services.name,
    })
    .from(appointments)
    .leftJoin(customers, eq(appointments.customerId, customers.id))
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .where(
      and(
        eq(appointments.tenantId, tenantId),
        gte(appointments.scheduledAt, startOfDay),
        lte(appointments.scheduledAt, endOfDay)
      )
    )
    .orderBy(appointments.scheduledAt);
}
