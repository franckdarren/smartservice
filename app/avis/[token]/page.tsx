import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppointmentByReviewToken, hasAlreadyReviewed } from "@/server/queries/reviews";
import { ReviewForm } from "@/features/reviews/review-form";
import { Star } from "lucide-react";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const appointment = await getAppointmentByReviewToken(token);
  if (!appointment) notFound();

  const alreadyReviewed = await hasAlreadyReviewed(appointment.id);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* En-tête */}
        <div className="text-center">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Star className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-bold">{appointment.tenantName ?? "SmartService"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Donnez votre avis sur votre prestation
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 pb-6">
            {alreadyReviewed ? (
              <div className="text-center py-4 space-y-2">
                <p className="font-medium">Avis déjà soumis</p>
                <p className="text-sm text-muted-foreground">
                  Vous avez déjà partagé votre retour pour ce rendez-vous. Merci !
                </p>
              </div>
            ) : (
              <ReviewForm
                token={token}
                customerName={appointment.customerName}
                serviceName={appointment.serviceName}
                tenantName={appointment.tenantName ?? null}
              />
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Propulsé par{" "}
          <a href="/" className="text-primary hover:underline">
            SmartService
          </a>
        </p>
      </div>
    </div>
  );
}
