import { db } from "@/lib/drizzle";
import { invoices, customers, appointments, services } from "@/lib/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getInvoices(tenantId: string) {
  return db
    .select({
      id: invoices.id,
      tenantId: invoices.tenantId,
      customerId: invoices.customerId,
      appointmentId: invoices.appointmentId,
      amount: invoices.amount,
      status: invoices.status,
      pdfUrl: invoices.pdfUrl,
      createdAt: invoices.createdAt,
      updatedAt: invoices.updatedAt,
      customerName: customers.fullName,
      customerPhone: customers.phone,
      customerEmail: customers.email,
      serviceName: services.name,
      scheduledAt: appointments.scheduledAt,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .leftJoin(appointments, eq(invoices.appointmentId, appointments.id))
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .where(eq(invoices.tenantId, tenantId))
    .orderBy(desc(invoices.createdAt));
}

export async function getInvoiceById(tenantId: string, invoiceId: string) {
  const [row] = await db
    .select({
      id: invoices.id,
      tenantId: invoices.tenantId,
      customerId: invoices.customerId,
      appointmentId: invoices.appointmentId,
      amount: invoices.amount,
      status: invoices.status,
      pdfUrl: invoices.pdfUrl,
      createdAt: invoices.createdAt,
      updatedAt: invoices.updatedAt,
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
    .where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)))
    .limit(1);

  return row ?? null;
}
