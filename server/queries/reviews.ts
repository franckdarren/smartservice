import { db } from "@/lib/drizzle";
import { reviews, customers, appointments, services, tenants } from "@/lib/drizzle/schema";
import { eq, and, desc, avg, count } from "drizzle-orm";

export async function getReviewsByTenant(tenantId: string) {
  return db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      customerName: customers.fullName,
      serviceName: services.name,
    })
    .from(reviews)
    .leftJoin(customers, eq(reviews.customerId, customers.id))
    .leftJoin(appointments, eq(reviews.appointmentId, appointments.id))
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .where(eq(reviews.tenantId, tenantId))
    .orderBy(desc(reviews.createdAt));
}

export async function getReviewStatsByTenant(tenantId: string) {
  const [stats] = await db
    .select({
      average: avg(reviews.rating),
      total: count(reviews.id),
    })
    .from(reviews)
    .where(eq(reviews.tenantId, tenantId));

  return {
    average: stats?.average ? Number(Number(stats.average).toFixed(1)) : 0,
    total: stats?.total ?? 0,
  };
}

export async function getAppointmentByReviewToken(token: string) {
  const [appt] = await db
    .select({
      id: appointments.id,
      tenantId: appointments.tenantId,
      customerId: appointments.customerId,
      reviewToken: appointments.reviewToken,
      customerName: customers.fullName,
      serviceName: services.name,
      scheduledAt: appointments.scheduledAt,
      tenantName: tenants.name,
    })
    .from(appointments)
    .leftJoin(customers, eq(appointments.customerId, customers.id))
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .leftJoin(tenants, eq(appointments.tenantId, tenants.id))
    .where(eq(appointments.reviewToken, token))
    .limit(1);

  return appt ?? null;
}

export async function hasAlreadyReviewed(appointmentId: string) {
  const [existing] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.appointmentId, appointmentId))
    .limit(1);

  return !!existing;
}
