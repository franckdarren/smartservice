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
  tagline: z.string().max(120, "120 caractères max").optional().or(z.literal("")),
  bio: z.string().max(800, "800 caractères max").optional().or(z.literal("")),
  serviceArea: z.string().max(200, "200 caractères max").optional().or(z.literal("")),
  businessHours: z.string().max(500, "500 caractères max").optional().or(z.literal("")),
});

export async function updateTenantSettings(formData: FormData) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "Non autorisé" };

  const raw = {
    name: formData.get("name") as string,
    whatsappNumber: (formData.get("whatsappNumber") as string) || undefined,
    customDomain: (formData.get("customDomain") as string) || undefined,
    tagline: (formData.get("tagline") as string) || undefined,
    bio: (formData.get("bio") as string) || undefined,
    serviceArea: (formData.get("serviceArea") as string) || undefined,
    businessHours: (formData.get("businessHours") as string) || undefined,
  };

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(tenants)
    .set({
      name: parsed.data.name,
      whatsappNumber: parsed.data.whatsappNumber || null,
      customDomain: parsed.data.customDomain || null,
      tagline: parsed.data.tagline || null,
      bio: parsed.data.bio || null,
      serviceArea: parsed.data.serviceArea || null,
      businessHours: parsed.data.businessHours || null,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenant.id));

  revalidatePath("/dashboard/parametres");
  revalidatePath(`/${tenant.slug}`);
  return { success: true };
}
