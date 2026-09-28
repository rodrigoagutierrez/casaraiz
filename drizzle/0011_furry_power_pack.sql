ALTER TABLE "properties" ADD COLUMN "registro_numero" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "registro_tipo" text DEFAULT 'temporada' NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "referencia_catastral" text;