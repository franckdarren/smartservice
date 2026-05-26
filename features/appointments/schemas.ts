import { z } from "zod";

// Schema pour l'action serveur (validation complète)
export const appointmentSchema = z.object({
  customerId: z.string().uuid("Client invalide"),
  serviceId: z.string().uuid("Service invalide").optional().or(z.literal("")),
  scheduledAt: z.string().min(1, "La date et l'heure sont requises"),
  status: z.enum(["pending", "confirmed", "done", "cancelled"]),
  notes: z.string().optional(),
});

// Schema minimal pour react-hook-form (champs input HTML uniquement)
export const appointmentFormSchema = z.object({
  scheduledAt: z.string().min(1, "La date et l'heure sont requises"),
  notes: z.string().optional(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type AppointmentFormInput = z.infer<typeof appointmentFormSchema>;
