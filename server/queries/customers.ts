import { db } from "@/lib/drizzle";
import { customers, appointments } from "@/lib/drizzle/schema";
import { eq, desc, count } from "drizzle-orm";

export async function getCustomers(tenantId: string) {
  return db
    .select()
    .from(customers)
    .where(eq(customers.tenantId, tenantId))
    .orderBy(desc(customers.createdAt));
}

export async function getCustomerById(tenantId: string, customerId: string) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  if (!customer || customer.tenantId !== tenantId) return null;
  return customer;
}

export async function getCustomerWithAppointments(tenantId: string, customerId: string) {
  const customer = await getCustomerById(tenantId, customerId);
  if (!customer) return null;

  const customerAppointments = await db
    .select()
    .from(appointments)
    .where(eq(appointments.customerId, customerId))
    .orderBy(desc(appointments.scheduledAt));

  return { customer, appointments: customerAppointments };
}
