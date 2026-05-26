ALTER TABLE "appointments" ADD COLUMN "review_token" uuid;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_review_token_unique" UNIQUE("review_token");