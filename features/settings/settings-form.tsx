"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Globe, Info, Sparkles } from "lucide-react";
import { updateTenantSettings } from "@/server/actions/settings";
import { toast } from "sonner";
import type { Tenant } from "@/types";

const PLAN_LABELS: Record<string, { label: string; class: string }> = {
  free: { label: "Free", class: "bg-gray-100 text-gray-600" },
  pro: { label: "Pro", class: "bg-blue-100 text-blue-700" },
  business: { label: "Business", class: "bg-yellow-100 text-yellow-700" },
};

interface SettingsFormProps {
  tenant: Tenant;
}

export function SettingsForm({ tenant }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const planCfg = PLAN_LABELS[tenant.plan] ?? PLAN_LABELS.free;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateTenantSettings(formData);
    setLoading(false);
    if (result?.error) toast.error(result.error);
    else toast.success("Paramètres enregistrés");
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
      {/* Informations générales */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <CardTitle className="text-base">Informations générales</CardTitle>
            <Badge className={planCfg.class} variant="outline">
              Plan {planCfg.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'entreprise</Label>
            <Input
              id="name"
              name="name"
              defaultValue={tenant.name}
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL publique)</Label>
            <Input
              id="slug"
              name="slug"
              value={tenant.slug}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground break-all">
              Votre page publique :{" "}
              <a
                href={`${process.env.NEXT_PUBLIC_APP_URL}/${tenant.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-primary hover:underline"
              >
                {process.env.NEXT_PUBLIC_APP_URL}/{tenant.slug}
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">Numéro WhatsApp</Label>
            <Input
              id="whatsappNumber"
              name="whatsappNumber"
              defaultValue={tenant.whatsappNumber ?? ""}
              placeholder="+241 77 00 00 00"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vitrine publique */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <span>Vitrine publique</span>
            </div>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Ces informations sont affichées sur votre landing page publique.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tagline">Accroche</Label>
            <Input
              id="tagline"
              name="tagline"
              defaultValue={tenant.tagline ?? ""}
              placeholder="Ex : Plombier professionnel à Libreville depuis 10 ans"
              maxLength={120}
            />
            <p className="text-xs text-muted-foreground">
              Une phrase courte qui décrit votre activité (120 caractères max).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Présentation</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={tenant.bio ?? ""}
              placeholder="Présentez votre entreprise, votre équipe, vos valeurs..."
              rows={4}
              maxLength={800}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceArea">Zone d'intervention</Label>
            <Input
              id="serviceArea"
              name="serviceArea"
              defaultValue={tenant.serviceArea ?? ""}
              placeholder="Ex : Libreville, Akanda, Owendo"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessHours">Horaires</Label>
            <Textarea
              id="businessHours"
              name="businessHours"
              defaultValue={tenant.businessHours ?? ""}
              placeholder={"Lun - Ven : 8h - 18h\nSam : 9h - 13h\nDim : fermé"}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              Une ligne par jour ou plage horaire.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Domaine personnalisé */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <div className="flex flex-wrap items-center gap-2">
              <Globe className="h-4 w-4 text-primary shrink-0" />
              <span>Domaine personnalisé</span>
              {tenant.plan !== "business" && (
                <Badge className="bg-yellow-100 text-yellow-700 text-xs" variant="outline">
                  Plan Business requis
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customDomain">Votre domaine</Label>
            <Input
              id="customDomain"
              name="customDomain"
              defaultValue={tenant.customDomain ?? ""}
              placeholder="maboutique.com"
              disabled={tenant.plan !== "business"}
            />
            <p className="text-xs text-muted-foreground">
              Entrez uniquement le domaine sans http:// (ex : maboutique.com)
            </p>
          </div>

          {tenant.plan === "business" && tenant.customDomain && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
                <Info className="h-4 w-4 shrink-0" />
                Instructions de configuration DNS
              </div>
              <p className="text-xs text-blue-700">
                Ajoutez un enregistrement CNAME chez votre registrar :
              </p>
              <div className="font-mono text-xs bg-white rounded border border-blue-200 p-2 space-y-1 overflow-x-auto">
                <p>
                  <span className="text-muted-foreground">Type :</span> CNAME
                </p>
                <p>
                  <span className="text-muted-foreground">Nom :</span>{" "}
                  {tenant.customDomain.startsWith("www.") ? "www" : "@"}
                </p>
                <p>
                  <span className="text-muted-foreground">Valeur :</span>{" "}
                  cname.vercel-dns.com
                </p>
              </div>
              <p className="text-xs text-blue-600">
                La propagation DNS peut prendre jusqu'à 48h.
              </p>
            </div>
          )}

          {tenant.plan !== "business" && (
            <p className="text-sm text-muted-foreground">
              Passez au plan Business pour utiliser votre propre domaine.
            </p>
          )}
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Enregistrer les modifications
      </Button>
    </form>
  );
}
