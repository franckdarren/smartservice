import { z } from "zod";

export const publicBookingSchema = z.object({
  fullName: z.string().min(2, "Le nom est requis"),
  phone: z
    .string()
    .min(8, "Numéro invalide")
    .regex(/^[+\d\s()-]+$/, "Format téléphone invalide"),
  email: z.email("Email invalide").optional().or(z.literal("")),
  serviceId: z.string().uuid("Service invalide").optional().or(z.literal("")),
  preferredDate: z.string().min(1, "La date est requise"),
  preferredTime: z.string().min(1, "L'heure est requise"),
  message: z.string().optional(),
});

export type PublicBookingInput = z.infer<typeof publicBookingSchema>;
