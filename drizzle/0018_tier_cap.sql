-- Capacidad del plan anual por tramo: el checkout guarda el tramo comprado en la suscripción.
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "tier_max_props" integer;

-- Tramos sin solape: 19 € hasta 2 pisos, 29 € de 3 a 5, más de 5 a consultar.
UPDATE fee_tiers SET min_props = 1, max_props = 2, amount_cents = 1900, label = 'Hasta 2 pisos', active = true
WHERE min_props = 1 AND max_props = 3;
UPDATE fee_tiers SET min_props = 3, max_props = 5, amount_cents = 2900, label = 'De 3 a 5 pisos', active = true
WHERE min_props = 3 AND max_props = 5;
UPDATE fee_tiers SET min_props = 6, max_props = NULL, amount_cents = NULL, label = 'Más de 5 pisos: plan a medida', active = true
WHERE min_props = 5 AND max_props IS NULL;

-- Plan anual de la tabla plans (referencia administrativa): 190 €/año = mensual x10 (2 meses gratis).
UPDATE plans SET amount_cents = 19000, name = 'Dueño anual (2 meses gratis)' WHERE plan = 'owner_yearly';
