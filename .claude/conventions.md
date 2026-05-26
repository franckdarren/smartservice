# Conventions de code

## Toujours

- Logique métier dans `features/` ou `server/` — jamais dans les composants UI
- Typer toutes les fonctions (pas de `any`)
- Server Actions pour toutes les mutations
- Valider avec Zod avant toute écriture en DB
- Fichiers en `kebab-case`, composants en `PascalCase`
- `cn()` de `lib/utils` pour les classes Tailwind conditionnelles

## Jamais

- Logique DB dans un composant React
- `tenant_id` hardcodé
- `console.log` en production
- `any` TypeScript
- Fetch direct côté client vers Supabase (passer par Server Actions)

## Internationalisation

- Langue : Français uniquement (MVP)
- Dates : `DD/MM/YYYY`
- Devise : XAF — ex: `15 000 FCFA`
- Téléphone : format Gabon `+241 XX XX XX XX`

## Design System

```
Primary    #2563EB   Bleu
Secondary  #F59E0B   Orange
Success    #10B981
Background #F8FAFC
Dark       #0F172A

Police : DM Sans (Google Fonts)
Composants : shadcn/ui New York style, radius 0.5
```
