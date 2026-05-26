import { z } from "zod";

export const customerSchema = z.object({
  fullName: z.string().min(2, "Le nom est requis"),
  phone: z
    .string()
    .min(8, "Numéro invalide")
    .regex(/^[+\d\s()-]+$/, "Format téléphone invalide"),
  email: z.email("Email invalide").optional().or(z.literal("")),
  address: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
