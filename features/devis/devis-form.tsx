"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, Sparkles, FileText, ArrowRight } from "lucide-react";
import { generateDevis } from "@/server/actions/devis";
import { toast } from "sonner";
import type { DevisResult } from "@/server/actions/devis";

export function DevisForm() {
  const [loading, setLoading] = useState(false);
  const [devis, setDevis] = useState<DevisResult | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setDevis(null);
    const formData = new FormData(e.currentTarget);
    const result = await generateDevis(formData);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else if (result?.devis) {
      setDevis(result.devis);
    }
  }

  async function convertToInvoice() {
    if (!devis) return;
    const params = new URLSearchParams({
      amount: String(devis.montantTotal),
      from: "devis",
    });
    window.location.href = `/dashboard/factures/nouveau?${params}`;
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Formulaire */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Décrivez le besoin client
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nom du client (optionnel)</Label>
              <Input
                id="customerName"
                name="customerName"
                placeholder="Ex : M. Okouyi Jean-Baptiste"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description du besoin</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Ex : Installation de panneaux solaires pour une maison de 4 pièces, câblage électrique complet, pose de 6 prises et 4 interrupteurs..."
                rows={5}
                required
                minLength={10}
              />
              <p className="text-xs text-muted-foreground">
                Soyez précis : type de travaux, superficie, nombre de pièces, matériaux souhaités...
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Générer le devis
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Résultat */}
      {devis && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                {devis.titre}
              </CardTitle>
              <p className="text-xl font-bold text-primary shrink-0">
                {new Intl.NumberFormat("fr-FR").format(devis.montantTotal)} FCFA
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tableau des lignes */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 font-medium">Désignation</th>
                    <th className="text-right py-2 font-medium w-16">Qté</th>
                    <th className="text-right py-2 font-medium w-32">Prix unit.</th>
                    <th className="text-right py-2 font-medium w-32">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {devis.lignes.map((ligne, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2.5">{ligne.designation}</td>
                      <td className="py-2.5 text-right">{ligne.quantite}</td>
                      <td className="py-2.5 text-right text-muted-foreground">
                        {new Intl.NumberFormat("fr-FR").format(ligne.prixUnitaire)} FCFA
                      </td>
                      <td className="py-2.5 text-right font-medium">
                        {new Intl.NumberFormat("fr-FR").format(ligne.total)} FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Separator />

            <div className="flex justify-end">
              <div className="text-right space-y-1">
                <p className="text-sm text-muted-foreground">
                  Sous-total : {new Intl.NumberFormat("fr-FR").format(devis.sousTotal)} FCFA
                </p>
                <p className="text-lg font-bold text-primary">
                  Total : {new Intl.NumberFormat("fr-FR").format(devis.montantTotal)} FCFA
                </p>
              </div>
            </div>

            {devis.notes && (
              <>
                <Separator />
                <p className="text-sm text-muted-foreground italic">{devis.notes}</p>
              </>
            )}

            <Separator />

            <div className="flex gap-3 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setDevis(null)}
              >
                Recommencer
              </Button>
              <Button onClick={convertToInvoice}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Convertir en facture
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
