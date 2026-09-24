import { db } from "@/shared/db/client";
import { feeTiers, siteSettings } from "./schema";
import { asc, eq } from "drizzle-orm";

export type FeeTier = typeof feeTiers.$inferSelect;

export async function getFeeTiers(): Promise<FeeTier[]> {
  return db.select().from(feeTiers).where(eq(feeTiers.active, true)).orderBy(asc(feeTiers.minProps));
}

export async function getAllFeeTiers(): Promise<FeeTier[]> {
  return db.select().from(feeTiers).orderBy(asc(feeTiers.minProps));
}

// Tramo que corresponde a N pisos (activos + borradores del dueño)
export async function tierForCount(count: number): Promise<FeeTier | undefined> {
  const tiers = await getFeeTiers();
  return tiers.find((t) => count >= t.minProps && (t.maxProps === null || count <= t.maxProps));
}

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const [r] = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return r?.value ?? fallback;
}

export async function getTariffSettings() {
  const [legend, contactLabel, contactUrl] = await Promise.all([
    getSetting("tariff_legend", "Precios con IVA incluido. Sin permanencia: cancela cuando quieras."),
    getSetting("tariff_contact_label", "¿Más de 10 propiedades?"),
    getSetting("tariff_contact_url", "mailto:hola@casaraiz.es"),
  ]);
  return { legend, contactLabel, contactUrl };
}
