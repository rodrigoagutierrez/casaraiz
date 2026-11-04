ALTER TYPE plan ADD VALUE 'owner_monthly';

INSERT INTO fee_tiers (min_props, max_props, amount_cents, label, active)
SELECT * FROM (VALUES
  (1, 3, 1900, 'Hasta 3 pisos', true),
  (3, 5, 2900, 'De 3 a 5 pisos', true),
  (5, NULL, NULL, 'Más de 5 pisos: plan a medida', true)
) AS v(min_props, max_props, amount_cents, label, active)
WHERE NOT EXISTS (
  SELECT 1 FROM fee_tiers WHERE fee_tiers.min_props = v.min_props AND fee_tiers.max_props IS NOT DISTINCT FROM v.max_props
);

UPDATE plans SET active = true WHERE plan = 'owner_monthly';
