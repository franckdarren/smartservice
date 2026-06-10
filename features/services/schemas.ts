import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(2, "Le nom du service est requis"),
  description: z.string().optional(),
  price: z
    .number({ message: "Le prix doit être un nombre" })
    .int("Le prix doit être un nombre entier")
    .min(0, "Le prix ne peut pas être négatif")
    .nullable()
    .optional(),
  duration: z.string().min(1, "La durée est requise"),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
