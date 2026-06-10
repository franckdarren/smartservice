-- Rendre price nullable (null = "Sur devis")
ALTER TABLE "services" ALTER COLUMN "price" DROP NOT NULL;--> statement-breakpoint

-- Ajouter colonne duration (texte libre)
ALTER TABLE "services" ADD COLUMN "duration" text;--> statement-breakpoint

-- Migrer les données existantes de duration_minutes vers duration
UPDATE "services" SET "duration" = CONCAT("duration_minutes"::text, ' min') WHERE "duration_minutes" IS NOT NULL;--> statement-breakpoint

-- Rendre duration NOT NULL maintenant que les données sont migrées
ALTER TABLE "services" ALTER COLUMN "duration" SET NOT NULL;--> statement-breakpoint

-- Supprimer l'ancienne colonne
ALTER TABLE "services" DROP COLUMN "duration_minutes";
