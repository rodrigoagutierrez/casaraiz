import { NextResponse } from "next/server";
import { getGuaranteeConfig } from "@/modules/billing/guarantee";

// GET /api/garantia/config — configuración pública (para cotizar en el formulario)
export async function GET() {
  const cfg = await getGuaranteeConfig().catch(() => null);
  if (!cfg || !cfg.activa) return NextResponse.json({ activa: false });
  return NextResponse.json({
    activa: true,
    nombre: cfg.nombre,
    pct: cfg.pct,
    minCents: cfg.minCents,
    maxCents: cfg.maxCents,
    texto: cfg.texto,
  });
}
