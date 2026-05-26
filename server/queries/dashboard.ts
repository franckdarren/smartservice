import { db } from "@/lib/drizzle";
import { customers, appointments, invoices } from "@/lib/drizzle/schema";
import { eq, and, gte, lte, count, sum } from "drizzle-orm";

export async function getDashboardKPIs(tenantId: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 86400000 - 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [customersCount] = await db
    .select({ count: count() })
    .from(customers)
    .where(eq(customers.tenantId, tenantId));

  const [appointmentsToday] = await db
    .select({ count: count() })
    .from(appointments)
    .where(
      and(
        eq(appointments.tenantId, tenantId),
        gte(appointments.scheduledAt, startOfDay),
        lte(appointments.scheduledAt, endOfDay)
      )
    );

  const [pendingAppointments] = await db
    .select({ count: count() })
    .from(appointments)
    .where(
      and(
        eq(appointments.tenantId, tenantId),
        eq(appointments.status, "pending")
      )
    );

  const [monthRevenue] = await db
    .select({ total: sum(invoices.amount) })
    .from(invoices)
    .where(
      and(
        eq(invoices.tenantId, tenantId),
        eq(invoices.status, "paid"),
        gte(invoices.createdAt, startOfMonth),
        lte(invoices.createdAt, endOfMonth)
      )
    );

  return {
    totalCustomers: customersCount.count,
    appointmentsToday: appointmentsToday.count,
    pendingAppointments: pendingAppointments.count,
    monthRevenue: Number(monthRevenue.total ?? 0),
  };
}
