ALTER TABLE "bookings" ADD COLUMN "garantia_optada" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "garantia_importe_cents" integer;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "garantia_estado" text DEFAULT 'ninguna' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "garantia_stripe_session" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "garantia_pagada_at" timestamp;