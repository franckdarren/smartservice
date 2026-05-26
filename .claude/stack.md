# Stack & Structure

## Stack technique

| Outil | Usage |
|-------|-------|
| Next.js 15 App Router + TypeScript strict | Framework |
| TailwindCSS + shadcn/ui (New York, radius 0.5) | Styling |
| Supabase (PostgreSQL) + Drizzle ORM | Base de données |
| Supabase Auth | Authentification email/password |
| Supabase Storage | Photos, logos |
| Cloudflare | Wildcard subdomains `*.smartservice.ga` |
| Vercel | Déploiement |

## Structure des dossiers

```
app/
  (marketing)/        → Homepage publique SmartService
  (auth)/             → Login / Register
  (dashboard)/        → Dashboard privé (auth requis)
  (tenant)/[slug]/    → Landing page publique prestataire

features/             → Logique métier (auth, tenants, customers, appointments, interventions, invoices, reviews)
components/
  ui/                 → shadcn/ui — ne jamais modifier manuellement
  dashboard/          → Composants dashboard
  tenant/             → Composants landing pages

lib/
  supabase/           → Clients browser + server
  drizzle/            → Schéma DB + instance
  utils/              → Helpers partagés

server/
  actions/            → Server Actions (mutations uniquement, pas de logique UI)
  queries/            → Requêtes DB (toujours filtrées par tenant_id)

types/                → Types TypeScript globaux
```

## Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_DOMAIN=smartservice.ga
DATABASE_URL=
NEXT_PUBLIC_APP_URL=https://app.smartservice.ga
```

## Commandes

```bash
npm run dev                  # Développement
npm run build                # Build
npm run lint                 # Lint
npx drizzle-kit generate     # Générer migration
npx drizzle-kit migrate      # Appliquer migration
npx drizzle-kit studio       # Explorer la DB
```
