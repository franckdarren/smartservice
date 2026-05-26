import { z } from "zod";

export const invoiceSchema = z.object({
  customerId: z.string().uuid("Client invalide"),
  appointmentId: z.string().uuid("RDV invalide").optional().or(z.literal("")),
  amount: z.number().int().min(0, "Le montant doit être positif"),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;
