-- Aceptación expresa de T&C + privacidad (checkbox post-registro en /mi-cuenta).
ALTER TABLE "users" ADD COLUMN "terms_accepted_at" timestamp;
