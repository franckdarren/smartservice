"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Users, FileText, Zap, Menu, X, CheckCircle } from "lucide-react";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-lg">SmartService</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Commencer gratuitement</Link>
              </Button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t py-4 space-y-2 pb-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  Se connecter
                </Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  Commencer gratuitement
                </Link>
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full mb-6">
            <Zap className="h-3.5 w-3.5" />
            <span>Conçu pour les artisans gabonais</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 leading-tight">
            Gérez votre activité de{" "}
            <span className="text-primary">services terrain</span> au Gabon
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Plombiers, électriciens, techniciens — gérez vos clients, rendez-vous
            et factures depuis un seul tableau de bord.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/register">Créer mon compte gratuit</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/login">Se connecter</Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground">
            {[
              "Sans carte bancaire",
              "Configuration en 2 min",
              "Support WhatsApp",
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 sm:py-16 px-4 bg-card">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
              Une plateforme complète pour gérer votre activité du quotidien.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Users, title: "Gestion clients", desc: "Fiches clients complètes avec historique des interventions" },
              { icon: Calendar, title: "Rendez-vous", desc: "Agenda intuitif et réservation en ligne pour vos clients" },
              { icon: FileText, title: "Facturation", desc: "Générez des factures PDF professionnelles en un clic" },
              { icon: Zap, title: "Vitrine en ligne", desc: "Votre landing page personnalisée pour attirer de nouveaux clients" },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="text-center p-5 sm:p-6 rounded-xl border bg-background hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">{title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Comment ça marche ?</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Démarrez en quelques minutes, sans installation.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              { step: "01", title: "Créez votre compte", desc: "Inscrivez-vous gratuitement et configurez votre profil en 2 minutes." },
              { step: "02", title: "Ajoutez vos services", desc: "Renseignez vos services, tarifs et disponibilités." },
              { step: "03", title: "Recevez des clients", desc: "Partagez votre lien et gérez vos réservations depuis le tableau de bord." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="w-10 h-10 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center mb-4 shrink-0">
                  {step}
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-16 px-4 bg-primary">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">
            Prêt à développer votre activité ?
          </h2>
          <p className="text-primary-foreground/80 mb-6 text-sm sm:text-base">
            Rejoignez les artisans gabonais qui gèrent leur activité avec SmartService.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
              <Link href="/register">Commencer gratuitement</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t py-6 sm:py-8 px-4 text-center text-sm text-muted-foreground">
        <p>© 2025 SmartService — Gabon</p>
      </footer>
    </div>
  );
}
