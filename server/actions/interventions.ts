"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/drizzle";
import { interventions } from "@/lib/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentTenant } from "@/server/queries/tenants";
import { createServiceClient } from "@/lib/supabase/server";
import { interventionSchema } from "@/features/interventions/schemas";

export async function createIntervention(formData: FormData) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "Non autorisé" };

  const raw = {
    appointmentId: formData.get("appointmentId") as string,
    technicianId: (formData.get("technicianId") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = interventionSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const [intervention] = await db
    .insert(interventions)
    .values({
      tenantId: tenant.id,
      appointmentId: parsed.data.appointmentId,
      technicianId: parsed.data.technicianId || null,
      notes: parsed.data.notes || null,
    })
    .returning({ id: interventions.id });

  revalidatePath("/dashboard/interventions");
  return { success: true, id: intervention.id };
}

export async function updateIntervention(interventionId: string, formData: FormData) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "Non autorisé" };

  const raw = {
    appointmentId: formData.get("appointmentId") as string,
    technicianId: (formData.get("technicianId") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = interventionSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(interventions)
    .set({
      notes: parsed.data.notes || null,
      technicianId: parsed.data.technicianId || null,
      updatedAt: new Date(),
    })
    .where(and(eq(interventions.id, interventionId), eq(interventions.tenantId, tenant.id)));

  revalidatePath("/dashboard/interventions");
  return { success: true };
}

export async function uploadInterventionPhoto(
  interventionId: string,
  formData: FormData,
  phase: "before" | "after"
) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "Non autorisé" };

  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) return { error: "Aucun fichier sélectionné" };

  if (!file.type.startsWith("image/")) return { error: "Le fichier doit être une image" };
  if (file.size > 5 * 1024 * 1024) return { error: "L'image ne doit pas dépasser 5 Mo" };

  const supabase = createServiceClient();

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `interventions/${tenant.id}/${interventionId}/${phase}/${Date.now()}.${ext}`;

  const bytes = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (uploadError) return { error: "Erreur lors de l'upload de la photo" };

  const { data: urlData } = supabase.storage.from("photos").getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  const [current] = await db
    .select({ photosBefore: interventions.photosBefore, photosAfter: interventions.photosAfter })
    .from(interventions)
    .where(and(eq(interventions.id, interventionId), eq(interventions.tenantId, tenant.id)))
    .limit(1);

  if (!current) return { error: "Intervention introuvable" };

  const fieldToUpdate =
    phase === "before"
      ? { photosBefore: [...(current.photosBefore ?? []), publicUrl] }
      : { photosAfter: [...(current.photosAfter ?? []), publicUrl] };

  await db
    .update(interventions)
    .set({ ...fieldToUpdate, updatedAt: new Date() })
    .where(and(eq(interventions.id, interventionId), eq(interventions.tenantId, tenant.id)));

  revalidatePath(`/dashboard/interventions/${interventionId}`);
  return { success: true, url: publicUrl };
}

export async function deleteInterventionPhoto(
  interventionId: string,
  photoUrl: string,
  phase: "before" | "after"
) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "Non autorisé" };

  const [current] = await db
    .select({ photosBefore: interventions.photosBefore, photosAfter: interventions.photosAfter })
    .from(interventions)
    .where(and(eq(interventions.id, interventionId), eq(interventions.tenantId, tenant.id)))
    .limit(1);

  if (!current) return { error: "Intervention introuvable" };

  const fieldToUpdate =
    phase === "before"
      ? { photosBefore: (current.photosBefore ?? []).filter((u) => u !== photoUrl) }
      : { photosAfter: (current.photosAfter ?? []).filter((u) => u !== photoUrl) };

  await db
    .update(interventions)
    .set({ ...fieldToUpdate, updatedAt: new Date() })
    .where(and(eq(interventions.id, interventionId), eq(interventions.tenantId, tenant.id)));

  revalidatePath(`/dashboard/interventions/${interventionId}`);
  return { success: true };
}
