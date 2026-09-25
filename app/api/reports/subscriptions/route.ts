import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/modules/auth/guard";
import { getSubscriptionReport } from "@/modules/reports/queries";
import { toCsv } from "@/modules/reports/csv";

// GET /api/reports/subscriptions — CSV con todas las suscripciones (solo admin)
export async function GET() {
  const admin = await getAdminIdentity().catch(() => null);
  if (!admin) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const rows = await getSubscriptionReport();
  const csv = toCsv(
    rows.map((s) => ({
      usuario: s.email ?? "—",
      plan: s.plan,
      estado: s.status,
      tipo: s.kind === "seasonal" ? "temporada" : s.origin,
      fin_periodo: s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toISOString().slice(0, 10) : "",
      creada: s.createdAt ? new Date(s.createdAt).toISOString().slice(0, 10) : "",
    }))
  );

  const content = "\uFEFF" + csv;
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="informe-suscripciones.csv"',
    },
  });
}
