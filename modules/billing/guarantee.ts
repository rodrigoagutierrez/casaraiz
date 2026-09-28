import { db } from "@/shared/db/client";
import { siteSettings } from "./schema";
import { eq } from "drizzle-orm";

export type GuaranteeConfig = {
  activa: boolean;
  nombre: string;
  pct: number;
  minCents: number;
  maxCents: number | null;
  texto: string;
};

export async function getGuaranteeConfig(): Promise<GuaranteeConfig> {
  const rows = await db.select().from(siteSettings);
  const get = (k: string, fb: string) => rows.find((r) => r.key === k)?.value ?? fb;
  const maxRaw = get("garantia_max_cents", "");
  return {
    activa: get("garantia_activa", "true") === "true",
    nombre: get("garantia_nombre", "Garantía CasaRaiz"),
    pct: Number(get("garantia_pct", "5")) || 5,
    minCents: Number(get("garantia_min_cents", "900")) || 900,
    maxCents: maxRaw === "" ? null : Number(maxRaw) || null,
    texto: get(
      "garantia_texto",
      "Cubre impagos y daños durante tu estancia a través de nuestra aseguradora colaboradora. Canon único no reembolsable."
    ),
  };
}

// Canon = % del total de la estancia, con mínimo y tope opcional.
export function quoteGuarantee(totalCents: number, cfg: GuaranteeConfig): number {
  const raw = Math.round((totalCents * cfg.pct) / 100);
  const floored = Math.max(raw, cfg.minCents);
  return cfg.maxCents !== null ? Math.min(floored, cfg.maxCents) : floored;
}

export function stayNights(checkin: string, checkout: string): number {
  return Math.max(1, Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000));
}

export async function saveGuaranteeSettings(input: Record<string, string>) {
  for (const [key, value] of Object.entries(input)) {
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
    if (existing.length === 0) await db.insert(siteSettings).values({ key, value });
    else await db.update(siteSettings).set({ value }).where(eq(siteSettings.key, key));
  }
}
