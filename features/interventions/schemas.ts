import { z } from "zod";

export const interventionSchema = z.object({
  appointmentId: z.string().uuid("RDV invalide"),
  technicianId: z.string().uuid("Technicien invalide").optional().or(z.literal("")),
  notes: z.string().max(2000).optional(),
});

export type InterventionInput = z.infer<typeof interventionSchema>;
