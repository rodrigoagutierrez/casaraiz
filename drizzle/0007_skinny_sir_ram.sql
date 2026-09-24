ALTER TABLE "properties" ADD COLUMN "max_huespedes" smallint DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "disponible_desde" date;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "disponible_hasta" date;