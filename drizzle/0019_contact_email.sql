-- Email de contacto público del superadmin (se muestra en «Quiénes somos»).
-- Null = se usa el email de la cuenta de Clerk.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "contact_email" text;
