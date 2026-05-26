"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/drizzle";
import { customers } from "@/lib/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentTenant } from "@/server/queries/tenants";
import { customerSchema } from "@/features/customers/schemas";

export async function createCustomer(formData: FormData) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "Non autorisé" };

  const raw = {
    fullName: formData.get("fullName") as string,
    phone: formData.get("phone") as string,
    email: (formData.get("email") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
  };

  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db.insert(customers).values({
    tenantId: tenant.id,
    fullName: parsed.data.fullName,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    address: parsed.data.address || null,
  });

  revalidatePath("/dashboard/clients");
  return { success: true };
}

export async function updateCustomer(customerId: string, formData: FormData) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "Non autorisé" };

  const raw = {
    fullName: formData.get("fullName") as string,
    phone: formData.get("phone") as string,
    email: (formData.get("email") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
  };

  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(customers)
    .set({
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      updatedAt: new Date(),
    })
    .where(and(eq(customers.id, customerId), eq(customers.tenantId, tenant.id)));

  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${customerId}`);
  return { success: true };
}

export async function deleteCustomer(customerId: string) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "Non autorisé" };

  await db
    .delete(customers)
    .where(and(eq(customers.id, customerId), eq(customers.tenantId, tenant.id)));

  revalidatePath("/dashboard/clients");
  return { success: true };
}
