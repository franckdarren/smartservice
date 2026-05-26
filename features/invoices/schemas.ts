import { z } from "zod";

export const invoiceSchema = z.object({
  customerId: z.string().uuid("Client invalide"),
  appointmentId: z.string().uuid("RDV invalide").optional().or(z.literal("")),
  amount: z.number().int().min(0, "Le montant doit être positif"),
});

export const paymentSchema = z.object({
  paymentMethod: z.enum(["cash", "airtel_money", "moov_money", "virement", "cheque"]),
  paidAt: z.string().min(1, "Date de paiement requise"),
  paymentReference: z.string().optional(),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
