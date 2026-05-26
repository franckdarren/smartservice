import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Users, FileText, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-semibold text-lg">SmartService</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/login">Se connecter</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Commencer gratuitement</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Gérez votre activité de{" "}
            <span className="text-primary">services terrain</span> au Gabon
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            Plombiers, électriciens, techniciens — gérez vos clients, rendez-vous
            et factures depuis un seul tableau de bord.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button size="lg" asChild>
              <Link href="/register">Créer mon compte gratuit</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-card">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">
            Tout ce dont vous avez besoin
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: "Gestion clients", desc: "Fiches clients et historique complet" },
              { icon: Calendar, title: "Rendez-vous", desc: "Agenda et réservation en ligne" },
              { icon: FileText, title: "Facturation", desc: "Factures PDF en un clic" },
              { icon: Zap, title: "Landing page", desc: "Votre vitrine en ligne personnalisée" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-6 rounded-lg border">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Prêt à démarrer ?</h2>
          <p className="text-muted-foreground mb-6">
            Créez votre compte gratuit en moins de 2 minutes.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">Commencer gratuitement</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© 2025 SmartService — Gabon</p>
      </footer>
    </div>
  );
}
