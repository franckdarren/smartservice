import { notFound } from "next/navigation";
import { MapPin, Phone, Clock, Star } from "lucide-react";
import { getTenantBySlug } from "@/server/queries/tenants";
import { getServices } from "@/server/queries/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingForm } from "@/features/bookings/booking-form";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) return {};

  return {
    title: `${tenant.name} — SmartService`,
    description: `Réservez en ligne avec ${tenant.name}`,
  };
}

export default async function TenantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);

  if (!tenant) notFound();

  const servicesList = await getServices(tenant.id);

  const planBadge = {
    free: null,
    pro: { label: "Pro", color: "bg-primary" },
    business: { label: "Business", color: "bg-secondary" },
  }[tenant.plan];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-sidebar text-sidebar-foreground py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            {tenant.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={tenant.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <span className="text-white font-bold text-3xl">
                {tenant.name[0].toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 mb-3">
            <h1 className="text-3xl font-bold">{tenant.name}</h1>
            {planBadge && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full text-white font-medium ${planBadge.color}`}
              >
                {planBadge.label}
              </span>
            )}
          </div>

          {tenant.whatsappNumber && (
            <a
              href={`https://wa.me/${tenant.whatsappNumber.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-2 text-sidebar-foreground/80 hover:text-sidebar-foreground text-sm transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone className="h-4 w-4" />
              {tenant.whatsappNumber}
            </a>
          )}
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        {/* Services */}
        {servicesList.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Nos services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {servicesList.map((service) => (
                <Card key={service.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-primary">
                          {new Intl.NumberFormat("fr-FR").format(service.price)} FCFA
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          <Clock className="h-3 w-3" />
                          {service.durationMinutes} min
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Formulaire de réservation */}
        <section id="reserver">
          <Card>
            <CardHeader>
              <CardTitle>Demander un rendez-vous</CardTitle>
            </CardHeader>
            <CardContent>
              <BookingForm slug={slug} services={servicesList} />
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>
          Propulsé par{" "}
          <a href="/" className="text-primary hover:underline font-medium">
            SmartService
          </a>
        </p>
      </footer>
    </div>
  );
}
