"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Globe, Info } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Informations générales */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
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
            <p className="text-xs text-muted-foreground">
              Votre page publique :{" "}
              <span className="font-mono text-primary">
                {tenant.slug}.smartservice.ga
              </span>
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

      {/* Domaine personnalisé */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Domaine personnalisé
            {tenant.plan !== "business" && (
              <Badge className="bg-yellow-100 text-yellow-700 text-xs" variant="outline">
                Plan Business requis
              </Badge>
            )}
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
              <div className="font-mono text-xs bg-white rounded border border-blue-200 p-2 space-y-1">
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
