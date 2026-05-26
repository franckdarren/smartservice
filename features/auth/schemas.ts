import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Le nom complet est requis"),
  email: z.email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  companyName: z.string().min(2, "Le nom de l'entreprise est requis"),
  slug: z
    .string()
    .min(3, "Le slug doit contenir au moins 3 caractères")
    .max(30, "Le slug ne peut pas dépasser 30 caractères")
    .regex(/^[a-z0-9-]+$/, "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets"),
});

export const loginSchema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
