import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/shared/db/client";
import { bookings } from "@/modules/bookings/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/modules/billing/stripe";
import { getUserByClerkId } from "@/modules/users/queries";
import { eur } from "@/shared/utils/format";

// POST /api/garantia/checkout { bookingId } -> { url }
// Cobra el canon de garantía (pago único) cuando la reserva está confirmada.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const parsed = z.object({ bookingId: z.string().uuid() }).safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "DATOS_INVALIDOS" }, { status: 400 });

  const me = await getUserByClerkId(userId);
  if (!me) return NextResponse.json({ error: "SIN_PERFIL" }, { status: 404 });

  const [b] = await db.select().from(bookings).where(eq(bookings.id, parsed.data.bookingId)).limit(1);
  if (!b || b.renterId !== me.id) return NextResponse.json({ error: "NO_AUTORIZADO" }, { status: 403 });
  if (!b.garantiaOptada || !b.garantiaImporteCents) {
    return NextResponse.json({ error: "SIN_GARANTIA" }, { status: 400 });
  }
  if (b.garantiaEstado === "pagada") return NextResponse.json({ error: "YA_PAGADA" }, { status: 400 });

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? (host ? `https://${host}` : "http://localhost:3000");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: me.email,
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: b.garantiaImporteCents,
          product_data: { name: `Garantía CasaRaiz — reserva ${b.checkin} → ${b.checkout}` },
          tax_behavior: "inclusive",
        },
        quantity: 1,
      },
    ],
    success_url: `${site}/reservas?garantia=ok`,
    cancel_url: `${site}/reservas`,
    metadata: { tipo: "garantia", bookingId: b.id, userId: me.id },
    payment_method_types: ["card"],
  });

  await db
    .update(bookings)
    .set({ garantiaEstado: "pendiente_pago", garantiaStripeSession: session.id })
    .where(eq(bookings.id, b.id));

  return NextResponse.json({ url: session.url, importe: eur(b.garantiaImporteCents) });
}
