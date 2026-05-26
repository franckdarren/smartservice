import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTenantBySlug } from "@/server/queries/tenants";
import { notFound } from "next/navigation";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Demande envoyée !</h1>
          <p className="text-muted-foreground mb-6">
            Votre demande de rendez-vous a été transmise à{" "}
            <strong>{tenant.name}</strong>. Ils vous contacteront pour
            confirmer le rendez-vous.
          </p>
          {tenant.whatsappNumber && (
            <p className="text-sm text-muted-foreground mb-6">
              Vous pouvez aussi contacter directement{" "}
              <a
                href={`https://wa.me/${tenant.whatsappNumber.replace(/\D/g, "")}`}
                className="text-green-600 hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                via WhatsApp
              </a>
              .
            </p>
          )}
          <Button asChild variant="outline">
            <Link href={`/${slug}`}>Retour à la page d&apos;accueil</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
