# Roadmap d'implémentation

---

## Phase 1 — MVP (en cours)

### 1.1 Setup projet
- [ ] Initialiser Next.js 15 avec TypeScript strict
- [ ] Configurer TailwindCSS + shadcn/ui (New York, radius 0.5)
- [ ] Installer et configurer Drizzle ORM + `drizzle.config.ts`
- [ ] Créer le projet Supabase et renseigner les variables d'environnement
- [ ] Définir le schéma Drizzle complet (`lib/drizzle/schema.ts`)
- [ ] Générer et appliquer la première migration
- [ ] Configurer les clients Supabase (`lib/supabase/client.ts` + `server.ts`)

### 1.2 Middleware multi-tenant
- [ ] Créer `middleware.ts` à la racine
- [ ] Extraire le subdomain depuis `request.headers.get('host')`
- [ ] Router vers `(dashboard)` si subdomain = `app`
- [ ] Router vers `(marketing)` si pas de subdomain
- [ ] Router vers `(tenant)/[slug]` pour tout autre subdomain
- [ ] Injecter le `tenant_id` résolu dans les headers de la requête

### 1.3 Auth — Register / Login
- [ ] Page `/register` : formulaire (nom, email, mot de passe, nom de l'entreprise, slug)
- [ ] Server Action `registerTenant` : créer l'entrée `tenants` + compte Supabase Auth
- [ ] Page `/login` : formulaire email + mot de passe
- [ ] Server Action `loginUser` : authentification via Supabase Auth
- [ ] Redirection post-login vers `app.smartservice.ga/dashboard`
- [ ] Page `/logout` avec invalidation de session
- [ ] Protection des routes `(dashboard)` via middleware (redirect si non authentifié)

### 1.4 Dashboard — Layout
- [ ] Layout principal `app/(dashboard)/layout.tsx` avec sidebar + topbar
- [ ] Sidebar : navigation vers Clients, Services, Rendez-vous, Interventions
- [ ] Topbar : nom du tenant, avatar, bouton déconnexion
- [ ] Page d'accueil dashboard `/dashboard` : KPIs (nb clients, RDV du jour, CA du mois)
- [ ] Composants réutilisables : `StatCard`, `SidebarNav`, `DashboardHeader`

### 1.5 CRUD Clients (Customers)
- [ ] Page liste `/dashboard/clients` : tableau paginé des clients
- [ ] Page détail `/dashboard/clients/[id]` : infos + historique RDV
- [ ] Formulaire création/édition client (nom, téléphone, email, adresse)
- [ ] Server Actions : `createCustomer`, `updateCustomer`, `deleteCustomer`
- [ ] Queries : `getCustomers(tenantId)`, `getCustomerById(tenantId, id)`
- [ ] Validation Zod pour toutes les mutations

### 1.6 CRUD Services
- [ ] Page liste `/dashboard/services` : grille ou tableau des services
- [ ] Formulaire création/édition (nom, description, prix FCFA, durée en minutes)
- [ ] Server Actions : `createService`, `updateService`, `deleteService`
- [ ] Queries : `getServices(tenantId)`, `getServiceById(tenantId, id)`
- [ ] Validation Zod pour toutes les mutations

### 1.7 Rendez-vous (Appointments)
- [ ] Page liste `/dashboard/rendez-vous` : vue calendrier + vue liste
- [ ] Formulaire création RDV (client, service, date/heure, statut, urgent)
- [ ] Server Actions : `createAppointment`, `updateAppointment`, `cancelAppointment`
- [ ] Queries : `getAppointments(tenantId)`, `getAppointmentsByDate(tenantId, date)`
- [ ] Changement de statut rapide (`pending` → `confirmed` → `done`)
- [ ] Badge "Urgent" visible sur les cartes RDV
- [ ] Validation Zod pour toutes les mutations

### 1.8 Landing page publique
- [ ] Page `app/(tenant)/[slug]/page.tsx` : récupérer le tenant via le slug
- [ ] Sections : hero (nom + logo), liste des services, formulaire de réservation
- [ ] Gestion 404 si slug inexistant
- [ ] Page statiquement générée (ISR) avec revalidation

### 1.9 Formulaire de réservation public
- [ ] Formulaire : nom, téléphone, email, service souhaité, date/heure souhaitée, message
- [ ] Server Action `createPublicBooking` : créer un RDV avec statut `pending`
- [ ] Validation Zod côté serveur
- [ ] Page de confirmation après soumission
- [ ] Pas d'authentification requise côté client

---

## Phase 2 — Fonctionnalités avancées

### 2.1 Interventions & Galerie avant/après
- [ ] Page `/dashboard/interventions` liée aux RDV `done`
- [ ] Formulaire : notes technicien, upload photos avant/après (Supabase Storage)
- [ ] Affichage galerie sur la fiche intervention
- [ ] Server Actions : `createIntervention`, `uploadInterventionPhoto`

### 2.2 Facturation
- [ ] Page `/dashboard/factures` : liste des factures avec statuts
- [ ] Génération automatique de facture à la clôture d'un RDV
- [ ] Template PDF (React PDF ou Puppeteer)
- [ ] Upload PDF dans Supabase Storage + lien de téléchargement
- [ ] Statuts : `draft` | `sent` | `paid`
- [ ] Server Actions : `createInvoice`, `markInvoicePaid`, `generateInvoicePdf`

### 2.3 Avis clients
- [ ] Envoi d'un lien d'avis après RDV `done`
- [ ] Page publique `/avis/[token]` : formulaire note (1-5) + commentaire
- [ ] Affichage des avis sur la landing page publique
- [ ] Server Actions : `submitReview`, `getReviewsByTenant`

### 2.4 WhatsApp automation
- [ ] Intégration API WhatsApp Business (ou Twilio)
- [ ] Notification au prestataire à chaque nouvelle réservation
- [ ] Rappel automatique au client 24h avant le RDV
- [ ] Message de confirmation après création de RDV

### 2.5 PWA
- [ ] Ajouter `next-pwa` ou manifest + service worker manuellement
- [ ] Icônes, splash screen, `manifest.json`
- [ ] Mode offline basique pour la lecture du dashboard

---

## Phase 3 — Croissance & Monétisation

### 3.1 Paiement
- [ ] Intégration Stripe (cartes internationales)
- [ ] Intégration Airtel Money (Gabon)
- [ ] Intégration Moov Money (Gabon)
- [ ] Page de paiement en ligne après réservation
- [ ] Webhooks de confirmation de paiement
- [ ] Mise à jour statut facture après paiement reçu

### 3.2 IA — Génération de devis
- [ ] Formulaire description de besoin client (texte libre)
- [ ] Appel API Claude/OpenAI pour suggérer un devis structuré
- [ ] Conversion du devis en facture en un clic

### 3.3 Domaine personnalisé (plan Business)
- [ ] Champ `custom_domain` sur le tenant
- [ ] Configuration Cloudflare via API pour pointer le domaine personnalisé
- [ ] Middleware : détecter les domaines personnalisés et router vers le bon tenant
- [ ] Interface dashboard pour renseigner et vérifier le domaine

---

## Ordre d'implémentation recommandé

```
1.1 Setup → 1.2 Middleware → 1.3 Auth → 1.4 Dashboard Layout
→ 1.5 Clients → 1.6 Services → 1.7 Rendez-vous
→ 1.8 Landing page → 1.9 Réservation publique
→ Phase 2 → Phase 3
```
