import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(2, "Le nom du service est requis"),
  description: z.string().optional(),
  price: z
    .number({ error: "Le prix doit être un nombre" })
    .int("Le prix doit être un nombre entier")
    .min(0, "Le prix ne peut pas être négatif"),
  durationMinutes: z
    .number({ error: "La durée doit être un nombre" })
    .int("La durée doit être un nombre entier")
    .min(5, "La durée minimale est de 5 minutes"),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
