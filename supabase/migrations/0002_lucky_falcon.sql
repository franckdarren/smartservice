CREATE TYPE "public"."payment_method" AS ENUM('cash', 'airtel_money', 'moov_money', 'virement', 'cheque');--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "payment_method" "payment_method";--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "paid_at" timestamp;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "payment_reference" text;