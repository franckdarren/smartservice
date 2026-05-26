# SmartService — Contexte projet pour Claude Code

## 🎯 C'est quoi ce projet ?

**SmartService** est un SaaS multi-tenant destiné aux prestataires de services terrain (artisans, techniciens, indépendants) en Afrique francophone (Gabon).

Chaque prestataire obtient :
- Un dashboard privé sur `app.smartservice.ga`
- Une landing page publique sur `{slug}.smartservice.ga`
- Un mini-CRM + calendrier + facturation + réservation en ligne

---

## 🏗️ Stack technique

- **Framework** : Next.js 15 App Router + TypeScript strict
- **Styling** : TailwindCSS + shadcn/ui
- **Base de données** : Supabase (PostgreSQL) + Drizzle ORM
- **Auth** : Supabase Auth (email/password)
- **Storage** : Supabase Storage (photos interventions, logos)
- **DNS** : Cloudflare (wildcard subdomains `*.smartservice.ga`)
- **Deploy** : Vercel

---

## 📁 Structure des dossiers

```
app/
  (marketing)/        → Homepage SmartService publique
  (auth)/             → Login / Register
  (dashboard)/        → Dashboard privé prestataire (auth requis)
  (tenant)/[slug]/    → Landing page publique du prestataire

features/             → Logique métier par domaine
  auth/
  tenants/
  customers/
  appointments/
  interventions/
  invoices/
  reviews/

components/
  ui/                 → shadcn/ui (jamais modifiés manuellement)
  dashboard/          → Composants spécifiques au dashboard
  tenant/             → Composants spécifiques aux landing pages

lib/
  supabase/           → Clients Supabase (browser + server)
  drizzle/            → Schéma DB + instance drizzle
  utils/              → Helpers partagés

server/
  actions/            → Server Actions (jamais de logique UI ici)
  queries/            → Requêtes DB (toujours filtrées par tenant_id)

types/                → Types TypeScript globaux
```

---

## 🧩 Multi-tenant — Règles critiques

1. **Toutes les tables ont un `tenant_id`** — sans exception
2. **Toutes les queries DB filtrent par `tenant_id`** — sans exception
3. Le `tenant_id` est extrait depuis le subdomain dans `middleware.ts`
4. Ne jamais faire confiance au `tenant_id` côté client — toujours le vérifier côté serveur

### Logique subdomain :
```
app.smartservice.ga        → Route vers (dashboard)
smartservice.ga            → Route vers (marketing)
{slug}.smartservice.ga     → Route vers (tenant)/[slug]
```

---

## 🗄️ Schéma DB — Tables principales

```
tenants         → id, name, slug, custom_domain, plan, logo_url, whatsapp_number
users           → id, tenant_id, email, full_name, role
customers       → id, tenant_id, full_name, phone, email, address
services        → id, tenant_id, name, description, price, duration_minutes
appointments    → id, tenant_id, customer_id, service_id, scheduled_at, status, is_urgent
interventions   → id, tenant_id, appointment_id, technician_id, notes, photos_before, photos_after
invoices        → id, tenant_id, customer_id, appointment_id, amount, status, pdf_url
reviews         → id, tenant_id, customer_id, appointment_id, rating, comment
```

**Statuts appointments** : `pending` | `confirmed` | `done` | `cancelled`
**Plans** : `free` | `pro` | `business`
**Rôles** : `admin` | `staff`

---

## 🎨 Design System

```
Couleurs :
  Primary     #2563EB   (bleu)
  Secondary   #F59E0B   (orange)
  Success     #10B981
  Background  #F8FAFC
  Dark        #0F172A

Police : DM Sans (Google Fonts)
Composants : shadcn/ui (New York style, radius 0.5)
```

---

## ⚙️ Commandes utiles

```bash
# Développement
npm run dev

# DB — générer migration
npx drizzle-kit generate

# DB — appliquer migration
npx drizzle-kit migrate

# DB — explorer
npx drizzle-kit studio

# Build
npm run build

# Lint
npm run lint
```

---

## 📋 Conventions de code

### À TOUJOURS faire :
- Logique métier dans `features/` ou `server/` — **jamais** dans les composants UI
- Typer toutes les fonctions (pas de `any`)
- Server Actions pour toutes les mutations
- Valider avec **Zod** avant toute écriture en DB
- Nommer les fichiers en `kebab-case`
- Nommer les composants en `PascalCase`
- Utiliser `cn()` de `lib/utils` pour les classes Tailwind conditionnelles

### À NE JAMAIS faire :
- Logique DB dans un composant React
- `tenant_id` hardcodé en dur
- `console.log` en production
- `any` TypeScript
- Fetch direct côté client vers Supabase (toujours passer par Server Actions)

---

## 🌍 Internationalisation

- Interface : **Français uniquement** (MVP)
- Formats dates : `DD/MM/YYYY`
- Devise : **XAF (FCFA)** — ex: `15 000 FCFA`
- Numéros téléphone : format Gabon `+241 XX XX XX XX`

---

## 📦 Variables d'environnement requises

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_DOMAIN=smartservice.ga
DATABASE_URL=
NEXT_PUBLIC_APP_URL=https://app.smartservice.ga
```

---

## 🚀 Phases de développement

### ✅ Phase 1 — MVP (en cours)
- [ ] Setup projet (Next.js + Supabase + Drizzle)
- [ ] Middleware multi-tenant
- [ ] Auth (register + login)
- [ ] Dashboard layout
- [ ] CRUD Customers
- [ ] CRUD Services
- [ ] Appointments (calendrier)
- [ ] Landing page publique
- [ ] Formulaire réservation public

### 🔜 Phase 2
- [ ] Facturation + PDF
- [ ] Galerie avant/après
- [ ] Avis clients
- [ ] WhatsApp automation
- [ ] PWA

### 🔮 Phase 3
- [ ] Paiement (Stripe + Airtel Money + Moov Money)
- [ ] IA devis
- [ ] Domaine personnalisé (plan business)

---

## 🔗 Ressources

- Supabase Dashboard : https://supabase.com/dashboard
- Drizzle Docs : https://orm.drizzle.team
- shadcn/ui : https://ui.shadcn.com
- Next.js App Router : https://nextjs.org/docs/app
