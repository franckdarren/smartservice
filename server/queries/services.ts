import { db } from "@/lib/drizzle";
import { services } from "@/lib/drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function getServices(tenantId: string) {
  return db
    .select()
    .from(services)
    .where(eq(services.tenantId, tenantId))
    .orderBy(desc(services.createdAt));
}

export async function getServiceById(tenantId: string, serviceId: string) {
  const [service] = await db
    .select()
    .from(services)
    .where(eq(services.id, serviceId))
    .limit(1);

  if (!service || service.tenantId !== tenantId) return null;
  return service;
}
