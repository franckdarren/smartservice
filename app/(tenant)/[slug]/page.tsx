import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  Clock,
  Star,
  MapPin,
  ShieldCheck,
  Sparkles,
  CalendarCheck,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { getTenantBySlug } from "@/server/queries/tenants";
import { getServices } from "@/server/queries/services";
import {
  getReviewsByTenant,
  getReviewStatsByTenant,
} from "@/server/queries/reviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingForm } from "@/features/bookings/booking-form";

export const revalidate = 3600;
export const maxDuration = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) return {};

  const description =
    tenant.tagline ?? `Réservez en ligne avec ${tenant.name}`;

  return {
    title: `${tenant.name} — ${tenant.tagline ?? "SmartService"}`,
    description,
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

  const [servicesList, reviewsList, reviewStats] = await Promise.all([
    getServices(tenant.id),
    getReviewsByTenant(tenant.id),
    getReviewStatsByTenant(tenant.id),
  ]);

  const planBadge = {
    free: null,
    pro: { label: "Pro", color: "bg-primary" },
    business: { label: "Business", color: "bg-secondary" },
  }[tenant.plan];

  const whatsappLink = tenant.whatsappNumber
    ? `https://wa.me/${tenant.whatsappNumber.replace(/\D/g, "")}`
    : null;

  const businessHoursLines = tenant.businessHours
    ?.split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden bg-sidebar text-sidebar-foreground">
        {/* Decorative gradient */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.25),transparent_60%)]"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -right-24 w-72 h-72 bg-primary/20 blur-3xl rounded-full"
        />

        <div className="relative max-w-5xl mx-auto px-4 py-12 sm:py-20">
          <div className="flex flex-col items-center text-center gap-5 sm:gap-6">
            {/* Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              {tenant.logoUrl ? (
                <img
                  src={tenant.logoUrl}
                  alt={tenant.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <span className="text-white font-bold text-3xl sm:text-4xl">
                  {tenant.name[0].toUpperCase()}
                </span>
              )}
            </div>

            {/* Plan badge */}
            {planBadge && (
              <span
                className={`text-xs px-2.5 py-1 rounded-full text-white font-medium ${planBadge.color}`}
              >
                {planBadge.label}
              </span>
            )}

            {/* Title + tagline */}
            <div className="space-y-3 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight wrap-break-word">
                {tenant.name}
              </h1>
              {tenant.tagline && (
                <p className="text-base sm:text-lg text-sidebar-foreground/80 wrap-break-word">
                  {tenant.tagline}
                </p>
              )}
            </div>

            {/* Reviews */}
            {reviewStats.total > 0 && (
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(reviewStats.average)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-sidebar-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">
                  {reviewStats.average}/5
                </span>
                <span className="text-xs text-sidebar-foreground/70">
                  ({reviewStats.total} avis)
                </span>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="#reserver">
                  <CalendarCheck className="h-4 w-4 mr-2" />
                  Prendre rendez-vous
                </Link>
              </Button>
              {whatsappLink && (
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto bg-white/5 border-white/20 text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-foreground"
                >
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contacter sur WhatsApp
                  </a>
                </Button>
              )}
            </div>

            {/* Meta info row */}
            {(tenant.serviceArea || tenant.whatsappNumber) && (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-4 text-sm text-sidebar-foreground/75">
                {tenant.serviceArea && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {tenant.serviceArea}
                  </span>
                )}
                {tenant.whatsappNumber && (
                  <span className="inline-flex items-center gap-1.5 break-all">
                    <Phone className="h-4 w-4 shrink-0" />
                    {tenant.whatsappNumber}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14 space-y-12 sm:space-y-16">
        {/* À PROPOS */}
        {tenant.bio && (
          <section>
            <div className="max-w-3xl">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3">
                À propos
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {tenant.bio}
              </p>
            </div>
          </section>
        )}

        {/* POURQUOI NOUS CHOISIR */}
        <section>
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center">
            Pourquoi nous choisir
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "Professionnels qualifiés",
                desc: "Une équipe expérimentée à votre service.",
              },
              {
                icon: CalendarCheck,
                title: "Réservation en ligne",
                desc: "Prenez rendez-vous en quelques clics, 24/7.",
              },
              {
                icon: Sparkles,
                title: "Service de qualité",
                desc: "Satisfaction garantie sur chaque intervention.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border bg-card p-5 text-center sm:text-left"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto sm:mx-0 mb-3">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SERVICES */}
        {servicesList.length > 0 && (
          <section id="services">
            <div className="flex items-end justify-between mb-6 gap-3 flex-wrap">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold">
                  Nos services
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Découvrez nos prestations et leurs tarifs.
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="#reserver">
                  Réserver
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {servicesList.map((service) => (
                <Card
                  key={service.id}
                  className="hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium wrap-break-word">
                          {service.name}
                        </p>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={`font-semibold text-sm sm:text-base whitespace-nowrap ${
                            service.price === null
                              ? "text-muted-foreground italic"
                              : "text-primary"
                          }`}
                        >
                          {service.price === null
                            ? "Sur devis"
                            : `${new Intl.NumberFormat("fr-FR").format(
                                service.price
                              )} FCFA`}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
                          <Clock className="h-3 w-3" />
                          {service.duration}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* INFOS PRATIQUES (horaires + zone) */}
        {(businessHoursLines?.length || tenant.serviceArea) && (
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-6">
              Informations pratiques
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {businessHoursLines && businessHoursLines.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Horaires
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {businessHoursLines.map((line, i) => (
                        <li key={i} className="wrap-break-word">
                          {line}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {tenant.serviceArea && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Zone d&apos;intervention
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground wrap-break-word">
                      {tenant.serviceArea}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        )}

        {/* AVIS CLIENTS */}
        {reviewsList.length > 0 && (
          <section>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold">
                Avis clients
              </h2>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(reviewStats.average)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-1">
                  {reviewStats.average}/5 ({reviewStats.total})
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {reviewsList.slice(0, 6).map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm wrap-break-word">
                          {review.customerName ?? "Client anonyme"}
                        </p>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mt-1 wrap-break-word">
                            {review.comment}
                          </p>
                        )}
                        {review.serviceName && (
                          <p className="text-xs text-muted-foreground mt-1 wrap-break-word">
                            {review.serviceName}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* FORMULAIRE DE RÉSERVATION */}
        <section id="reserver" className="scroll-mt-8">
          <Card className="border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">
                Demander un rendez-vous
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Remplissez le formulaire et nous vous recontactons rapidement.
              </p>
            </CardHeader>
            <CardContent>
              <BookingForm slug={slug} services={servicesList} />
            </CardContent>
          </Card>
        </section>
      </div>

      {/* FOOTER */}
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
