"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/drizzle";
import { services } from "@/lib/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentTenant } from "@/server/queries/tenants";
import { serviceSchema } from "@/features/services/schemas";

export async function createService(formData: FormData) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "Non autorisé" };

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    price: formData.get("price") as string,
    durationMinutes: formData.get("durationMinutes") as string,
  };

  const parsed = serviceSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db.insert(services).values({
    tenantId: tenant.id,
    name: parsed.data.name,
    description: parsed.data.description || null,
    price: parsed.data.price,
    durationMinutes: parsed.data.durationMinutes,
  });

  revalidatePath("/dashboard/services");
  return { success: true };
}

export async function updateService(serviceId: string, formData: FormData) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "Non autorisé" };

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    price: formData.get("price") as string,
    durationMinutes: formData.get("durationMinutes") as string,
  };

  const parsed = serviceSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(services)
    .set({
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      durationMinutes: parsed.data.durationMinutes,
      updatedAt: new Date(),
    })
    .where(and(eq(services.id, serviceId), eq(services.tenantId, tenant.id)));

  revalidatePath("/dashboard/services");
  return { success: true };
}

export async function deleteService(serviceId: string) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "Non autorisé" };

  await db
    .delete(services)
    .where(and(eq(services.id, serviceId), eq(services.tenantId, tenant.id)));

  revalidatePath("/dashboard/services");
  return { success: true };
}
