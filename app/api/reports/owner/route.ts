import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/modules/users/queries";
import { getOwnerBookingsReport } from "@/modules/reports/queries";
import { toCsv } from "@/modules/reports/csv";

// GET /api/reports/owner — CSV con las reservas/ganancias del dueño
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const me = await getUserByClerkId(userId);
  if (!me) return NextResponse.json({ error: "SIN_PERFIL" }, { status: 404 });

  const rows = await getOwnerBookingsReport(me.id);
  const csv = toCsv(
    rows.map((r) => ({
      piso: r.title,
      checkin: r.checkin,
      checkout: r.checkout,
      noches: r.nights,
      huespedes: r.guests,
      precio_noche_eur: (r.priceCents / 100).toFixed(2),
      ganancia_estimada_eur: (r.revenueCents / 100).toFixed(2),
    }))
  );

  const content = "\uFEFF" + csv; // BOM para Excel con acentos
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="informe-dueno.csv"',
    },
  });
}
