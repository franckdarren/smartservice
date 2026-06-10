-- Champs de personnalisation de la landing page tenant
ALTER TABLE "tenants" ADD COLUMN "cover_url" text;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "tagline" text;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "service_area" text;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "business_hours" text;
