"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/drizzle";
import { tenants } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { getCurrentTenant } from "@/server/queries/tenants";
import { z } from "zod";

const settingsSchema = z.object({
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  whatsappNumber: z
    .string()
    .regex(/^\+?[0-9\s]+$/, "Numéro invalide")
    .optional()
    .or(z.literal("")),
  customDomain: z
    .string()
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/, "Domaine invalide (ex: maboutique.com)")
    .optional()
    .or(z.literal("")),
});

export async function updateTenantSettings(formData: FormData) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "Non autorisé" };

  const raw = {
    name: formData.get("name") as string,
    whatsappNumber: (formData.get("whatsappNumber") as string) || undefined,
    customDomain: (formData.get("customDomain") as string) || undefined,
  };

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(tenants)
    .set({
      name: parsed.data.name,
      whatsappNumber: parsed.data.whatsappNumber || null,
      customDomain: parsed.data.customDomain || null,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenant.id));

  revalidatePath("/dashboard/parametres");
  return { success: true };
}
