"use server";

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getCurrentTenant } from "@/server/queries/tenants";
import { getServices } from "@/server/queries/services";

const devisRequestSchema = z.object({
  description: z.string().min(10, "Décrivez le besoin en au moins 10 caractères").max(2000),
  customerName: z.string().optional(),
});

export interface DevisLine {
  designation: string;
  quantite: number;
  prixUnitaire: number;
  total: number;
}

export interface DevisResult {
  titre: string;
  lignes: DevisLine[];
  sousTotal: number;
  notes: string;
  montantTotal: number;
}

export async function generateDevis(formData: FormData) {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: "Non autorisé" };

  const raw = {
    description: formData.get("description") as string,
    customerName: (formData.get("customerName") as string) || undefined,
  };

  const parsed = devisRequestSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const services = await getServices(tenant.id);
  const servicesContext =
    services.length > 0
      ? `Services disponibles dans le catalogue :\n${services
          .map((s) => `- ${s.name} : ${s.price !== null ? s.price.toLocaleString("fr-FR") + " FCFA" : "Sur devis"} (${s.duration})`)
          .join("\n")}`
      : "Aucun service dans le catalogue pour l'instant.";

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const systemPrompt = `Tu es un assistant pour ${tenant.name}, une entreprise de services au Gabon.
Tu dois générer un devis structuré en JSON pour une demande client.
La devise est le FCFA (Franc CFA). Les prix doivent être des entiers.
${servicesContext}

Réponds UNIQUEMENT avec un objet JSON valide respectant exactement ce format :
{
  "titre": "Titre court du devis",
  "lignes": [
    {
      "designation": "Nom de la prestation",
      "quantite": 1,
      "prixUnitaire": 25000,
      "total": 25000
    }
  ],
  "sousTotal": 25000,
  "notes": "Remarques ou conditions particulières",
  "montantTotal": 25000
}
Aucun texte avant ou après le JSON.`;

  const userMessage = `${parsed.data.customerName ? `Client : ${parsed.data.customerName}\n` : ""}Besoin : ${parsed.data.description}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const content = message.content[0];
    if (content.type !== "text") return { error: "Réponse inattendue de l'IA" };

    const devis = JSON.parse(content.text) as DevisResult;
    return { success: true, devis };
  } catch (err) {
    if (err instanceof SyntaxError) return { error: "L'IA n'a pas retourné un devis valide" };
    return { error: "Erreur lors de la génération du devis" };
  }
}
