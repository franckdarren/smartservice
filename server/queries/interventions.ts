import { db } from "@/lib/drizzle";
import { interventions, appointments, customers, services, users } from "@/lib/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getInterventions(tenantId: string) {
  return db
    .select({
      id: interventions.id,
      tenantId: interventions.tenantId,
      appointmentId: interventions.appointmentId,
      technicianId: interventions.technicianId,
      notes: interventions.notes,
      photosBefore: interventions.photosBefore,
      photosAfter: interventions.photosAfter,
      createdAt: interventions.createdAt,
      updatedAt: interventions.updatedAt,
      customerName: customers.fullName,
      customerPhone: customers.phone,
      serviceName: services.name,
      scheduledAt: appointments.scheduledAt,
      technicianName: users.fullName,
    })
    .from(interventions)
    .leftJoin(appointments, eq(interventions.appointmentId, appointments.id))
    .leftJoin(customers, eq(appointments.customerId, customers.id))
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .leftJoin(users, eq(interventions.technicianId, users.id))
    .where(eq(interventions.tenantId, tenantId))
    .orderBy(desc(interventions.createdAt));
}

export async function getInterventionById(tenantId: string, interventionId: string) {
  const [row] = await db
    .select({
      id: interventions.id,
      tenantId: interventions.tenantId,
      appointmentId: interventions.appointmentId,
      technicianId: interventions.technicianId,
      notes: interventions.notes,
      photosBefore: interventions.photosBefore,
      photosAfter: interventions.photosAfter,
      createdAt: interventions.createdAt,
      updatedAt: interventions.updatedAt,
      customerName: customers.fullName,
      customerPhone: customers.phone,
      customerAddress: customers.address,
      serviceName: services.name,
      servicePrice: services.price,
      scheduledAt: appointments.scheduledAt,
      appointmentNotes: appointments.notes,
      technicianName: users.fullName,
    })
    .from(interventions)
    .leftJoin(appointments, eq(interventions.appointmentId, appointments.id))
    .leftJoin(customers, eq(appointments.customerId, customers.id))
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .leftJoin(users, eq(interventions.technicianId, users.id))
    .where(and(eq(interventions.id, interventionId), eq(interventions.tenantId, tenantId)))
    .limit(1);

  return row ?? null;
}

export async function getInterventionByAppointmentId(tenantId: string, appointmentId: string) {
  const [row] = await db
    .select()
    .from(interventions)
    .where(
      and(
        eq(interventions.appointmentId, appointmentId),
        eq(interventions.tenantId, tenantId)
      )
    )
    .limit(1);

  return row ?? null;
}

export async function getCompletedAppointmentsWithoutIntervention(tenantId: string) {
  return db
    .select({
      id: appointments.id,
      scheduledAt: appointments.scheduledAt,
      customerName: customers.fullName,
      serviceName: services.name,
    })
    .from(appointments)
    .leftJoin(customers, eq(appointments.customerId, customers.id))
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .where(
      and(
        eq(appointments.tenantId, tenantId),
        eq(appointments.status, "done")
      )
    )
    .orderBy(desc(appointments.scheduledAt));
}
