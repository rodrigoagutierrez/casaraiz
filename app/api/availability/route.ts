import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/shared/db/client";
import { properties } from "@/shared/db/schema";
import { bookings } from "@/modules/bookings/schema";
import { and, eq, sql } from "drizzle-orm";

const querySchema = z.object({
  propertyId: z.string().uuid(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const DAY = 86400000;

function iso(t: number) {
  return new Date(t).toISOString().slice(0, 10);
}

function validDate(s: string) {
  const t = Date.parse(`${s}T00:00:00Z`);
  return !Number.isNaN(t) && iso(t) === s;
}

// GET /api/availability?propertyId=…&from=…&to=…
// Noches bloqueadas de un piso: reservas vivas (pending/confirmed) y ventana del dueño.
export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: "PARAMETROS_INVALIDOS" }, { status: 400 });
  const { propertyId, from, to } = parsed.data;
  if (!validDate(from) || !validDate(to) || to < from) {
    return NextResponse.json({ error: "PARAMETROS_INVALIDOS" }, { status: 400 });
  }

  const fromT = Date.parse(`${from}T00:00:00Z`);
  const toT = Date.parse(`${to}T00:00:00Z`);
  if ((toT - fromT) / DAY + 1 > 400) return NextResponse.json({ error: "RANGO_GRANDE" }, { status: 400 });

  const [prop] = await db
    .select({ disponibleDesde: properties.disponibleDesde, disponibleHasta: properties.disponibleHasta })
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);
  if (!prop) return NextResponse.json({ error: "NO_ENCONTRADO" }, { status: 404 });

  const rows = await db
    .select({ checkin: bookings.checkin, checkout: bookings.checkout })
    .from(bookings)
    .where(
      and(
        eq(bookings.propertyId, propertyId),
        sql`${bookings.status} in ('pending','confirmed')`,
        sql`${bookings.checkout} > ${from}`,
        sql`${bookings.checkin} <= ${to}`
      )
    );

  const blocked = new Map<string, "reserva" | "temporada">();

  for (const b of rows) {
    const start = Math.max(Date.parse(`${b.checkin}T00:00:00Z`), fromT);
    const end = Math.min(Date.parse(`${b.checkout}T00:00:00Z`) - DAY, toT);
    for (let t = start; t <= end; t += DAY) blocked.set(iso(t), "reserva");
  }

  for (let t = fromT; t <= toT; t += DAY) {
    const d = iso(t);
    if (blocked.has(d)) continue;
    if (prop.disponibleDesde && d < prop.disponibleDesde) blocked.set(d, "temporada");
    else if (prop.disponibleHasta && d > prop.disponibleHasta) blocked.set(d, "temporada");
  }

  return NextResponse.json({ from, to, blocked: [...blocked].map(([d, k]) => ({ d, k })) });
}
