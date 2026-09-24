// Uso: set -a && . ./.env.local && set +a && npx tsx scripts/seed-fees.ts
import { db } from "@/shared/db/client";
import { feeTiers, siteSettings } from "@/shared/db/schema";
import { eq } from "drizzle-orm";

const TIERS = [
  { minProps: 1, maxProps: 3, amountCents: 1900, label: "Hasta 3 pisos" },
  { minProps: 4, maxProps: 10, amountCents: 4900, label: "De 4 a 10 pisos" },
  { minProps: 11, maxProps: null, amountCents: null, label: "Más de 10 pisos: plan a medida" },
];

const SETTINGS = [
  { key: "tariff_legend", value: "Precios con IVA incluido. Sin permanencia: cancela cuando quieras. El tramo se calcula por tus pisos publicados." },
  { key: "tariff_contact_label", value: "¿Más de 10 propiedades? Te hacemos plan a medida" },
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
