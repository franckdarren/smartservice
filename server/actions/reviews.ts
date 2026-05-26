"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/drizzle";
import { reviews } from "@/lib/drizzle/schema";
import { reviewSchema } from "@/features/reviews/schemas";
import {
  getAppointmentByReviewToken,
  hasAlreadyReviewed,
} from "@/server/queries/reviews";

export async function submitReview(token: string, formData: FormData) {
  const appointment = await getAppointmentByReviewToken(token);
  if (!appointment) return { error: "Lien d'avis invalide ou expiré" };

  const alreadyReviewed = await hasAlreadyReviewed(appointment.id);
  if (alreadyReviewed) return { error: "Vous avez déjà soumis un avis pour ce rendez-vous" };

  const raw = {
    rating: Number(formData.get("rating")),
    comment: (formData.get("comment") as string) || undefined,
  };

  const parsed = reviewSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db.insert(reviews).values({
    tenantId: appointment.tenantId,
    customerId: appointment.customerId,
    appointmentId: appointment.id,
    rating: parsed.data.rating,
    comment: parsed.data.comment || null,
  });

  return { success: true };
}
