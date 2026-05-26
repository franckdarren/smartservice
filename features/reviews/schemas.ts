import { z } from "zod";

export const reviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "La note doit être entre 1 et 5")
    .max(5, "La note doit être entre 1 et 5"),
  comment: z.string().max(500).optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
