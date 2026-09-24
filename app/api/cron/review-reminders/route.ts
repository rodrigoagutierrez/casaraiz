import { NextResponse } from "next/server";
import { db } from "@/shared/db/client";
import { bookings, reviews } from "@/modules/bookings/schema";
import { users } from "@/modules/users/schema";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { sendEmail } from "@/modules/notifications/email";
import { logAudit } from "@/modules/audit/log";

// Endpoint para cron diario (Vercel Cron): recuerda valorar estancias
// finalizadas en las últimas 24h. Protegido por CRON_SECRET.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  // Checkout en las últimas 24h, reserva confirmada
  const rows = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.status, "confirmed"),
        lt(sql`${bookings.checkout}`, sql`current_date`),
        gt(sql`${bookings.checkout}`, sql`current_date - interval '1 day'`)
      )
    )
    .limit(200);

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://casaraiz.vercel.app";
  let reminded = 0;

  for (const b of rows) {
    const existing = await db.select({ kind: reviews.kind }).from(reviews).where(eq(reviews.bookingId, b.id));
    const kinds = new Set(existing.map((e) => e.kind));

    const [renter, owner] = await Promise.all([
      db.select().from(users).where(eq(users.id, b.renterId)).limit(1),
      db.select().from(users).where(eq(users.id, b.ownerId)).limit(1),
    ]);

    // Inquilino aún no valora al dueño
    if (!kinds.has("to_owner") && renter[0]) {
      await sendEmail(
        renter[0].email,
        "¿Qué tal tu estancia en CasaRaiz?",
        `Tu alquiler terminó hace unas horas. Valora al propietario (servicio, comunicación y entorno) en ${site}/reservas`
      );
      reminded++;
    }

    // Dueño aún no valora al inquilino
    if (!kinds.has("to_renter") && owner[0]) {
      await sendEmail(
        owner[0].email,
        "Valora a tu inquilino en CasaRaiz",
        `Tu inquilino ha hecho check-out. Puntúa su actitud en ${site}/reservas`
      );
      reminded++;
    }
  }

  await logAudit({ action: "review.reminder_sent", entity: "cron", meta: { reminded } });

  return NextResponse.json({ ok: true, reviewed: rows.length, reminded });
}
