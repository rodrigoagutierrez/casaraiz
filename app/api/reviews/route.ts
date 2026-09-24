import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/shared/db/client";
import { bookings, reviews } from "@/modules/bookings/schema";
import { and, eq } from "drizzle-orm";
import { getUserByClerkId } from "@/modules/users/queries";
import { reviewWindow } from "@/modules/bookings/queries";
import { logAudit } from "@/modules/audit/log";

const stars = z.number().int().min(1).max(5);

const bodySchema = z.object({
  bookingId: z.string().uuid(),
  // Inquilino → dueño/propiedad
  servicio: stars.optional(),
  comunicacion: stars.optional(),
  entorno: stars.optional(),
  // Dueño → inquilino
  actitud: stars.optional(),
  comment: z.string().max(1000).optional(),
});

// POST /api/reviews — solo estancias finalizadas, una por dirección
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "DATOS_INVALIDOS" }, { status: 400 });

  const me = await getUserByClerkId(userId);
  if (!me) return NextResponse.json({ error: "SIN_PERFIL" }, { status: 404 });

  const [b] = await db.select().from(bookings).where(eq(bookings.id, parsed.data.bookingId)).limit(1);
  if (!b) return NextResponse.json({ error: "NO_ENCONTRADA" }, { status: 404 });
  if (b.status !== "confirmed") return NextResponse.json({ error: "NO_FINALIZADA" }, { status: 400 });

  const w = reviewWindow(b.checkout);
  const pastLimit = new Date() > new Date(w.closesAt);
  if (!w.opened || pastLimit) return NextResponse.json({ error: "FUERA_DE_PLAZO" }, { status: 400 });

  const isRenter = b.renterId === me.id;
  const isOwner = b.ownerId === me.id;
  if (!isRenter && !isOwner) return NextResponse.json({ error: "NO_AUTORIZADO" }, { status: 403 });
  const kind = isRenter ? "to_owner" : "to_renter";

  const dup = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(and(eq(reviews.bookingId, b.id), eq(reviews.kind, kind)))
    .limit(1);
  if (dup.length > 0) return NextResponse.json({ error: "YA_VALORADA" }, { status: 400 });

  const { servicio, comunicacion, entorno, actitud, comment } = parsed.data;
  if (kind === "to_owner" && !servicio && !comunicacion && !entorno) {
    return NextResponse.json({ error: "FALTA_NOTA" }, { status: 400 });
  }
  if (kind === "to_renter" && !actitud) {
    return NextResponse.json({ error: "FALTA_NOTA" }, { status: 400 });
  }

  const [created] = await db
    .insert(reviews)
    .values({
      bookingId: b.id,
      propertyId: kind === "to_owner" ? b.propertyId : null,
      authorId: me.id,
      targetUserId: kind === "to_owner" ? b.ownerId : b.renterId,
      kind,
      servicio: kind === "to_owner" ? servicio ?? null : null,
      comunicacion: kind === "to_owner" ? comunicacion ?? null : null,
      entorno: kind === "to_owner" ? entorno ?? null : null,
      actitud: kind === "to_renter" ? actitud ?? null : null,
      comment: comment || null,
    })
    .returning();

  await logAudit({
    actorId: me.id,
    targetUserId: created.targetUserId,
    action: "review.created",
    entity: "review",
    entityId: created.id,
    meta: { bookingId: b.id, kind },
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
