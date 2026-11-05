// Uso: set -a && . ./.env.local && set +a && npx tsx scripts/seed-fees.ts
import { db } from "@/shared/db/client";
import { feeTiers, siteSettings } from "@/shared/db/schema";
import { eq } from "drizzle-orm";

const TIERS = [
  { minProps: 1, maxProps: 2, amountCents: 1900, label: "Hasta 2 pisos" },
  { minProps: 3, maxProps: 5, amountCents: 2900, label: "De 3 a 5 pisos" },
  { minProps: 6, maxProps: null, amountCents: null, label: "Más de 5 pisos: plan a medida" },
];

const SETTINGS = [
  { key: "tariff_legend", value: "Precios con IVA incluido. Sin permanencia: el cobro se hace al final de cada periodo y puedes cancelar la suscripción cuando quieras. El tramo se calcula por tus pisos publicados." },
  { key: "tariff_contact_label", value: "¿Más de 5 propiedades? Te hacemos plan a medida" },
  { key: "tariff_contact_url", value: "mailto:hola@casaraizalquiler.com?subject=Plan%20a%20medida" },
];

async function main() {
  for (const t of TIERS) {
    const existing = await db.select().from(feeTiers).where(eq(feeTiers.minProps, t.minProps)).limit(1);
    if (existing.length === 0) {
      await db.insert(feeTiers).values({ ...t, active: true });
      console.log("tier creado:", t.label);
    } else {
      console.log("tier existe:", t.label);
    }
  }
  for (const s of SETTINGS) {
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, s.key)).limit(1);
    if (existing.length === 0) {
      await db.insert(siteSettings).values(s);
      console.log("setting creado:", s.key);
    } else {
      console.log("setting existe:", s.key);
    }
  }
}

main().catch((e) => {
  console.error("FAIL:", e);
  process.exit(1);
});
