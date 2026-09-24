import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/shared/db/client";
import { properties } from "@/shared/db/schema";
import { bookings } from "@/modules/bookings/schema";
import { and, desc, eq, or, sql } from "drizzle-orm";
import { getUserByClerkId } from "@/modules/users/queries";
import { logAudit } from "@/modules/audit/log";

const createSchema = z.object({
  propertyId: z.string().uuid(),
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1).max(16),
});

// GET /api/bookings — mis reservas (como inquilino y como dueño)
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const me = await getUserByClerkId(userId);
  if (!me) return NextResponse.json({ data: [] });
  const rows = await db
    .select()
    .from(bookings)
    .where(or(eq(bookings.renterId, me.id), eq(bookings.ownerId, me.id)))
    .orderBy(desc(bookings.createdAt))
    .limit(100);
  return NextResponse.json({ data: rows });
}

// POST /api/bookings — el inquilino solicita fechas (el dueño confirma)
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "DATOS_INVALIDOS" }, { status: 400 });
  const { propertyId, checkin, checkout, guests } = parsed.data;
  if (checkout <= checkin) return NextResponse.json({ error: "FECHAS_INVALIDAS" }, { status: 400 });

  const me = await getUserByClerkId(userId);
  if (!me) return NextResponse.json({ error: "SIN_PERFIL" }, { status: 404 });

  const [prop] = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
  if (!prop || prop.status !== "active") return NextResponse.json({ error: "PISO_NO_DISPONIBLE" }, { status: 404 });
  if (prop.ownerId === me.id) return NextResponse.json({ error: "ES_TU_PISO" }, { status: 400 });
  if (guests > prop.maxHuespedes) return NextResponse.json({ error: "EXCEDE_CAPACIDAD", max: prop.maxHuespedes }, { status: 400 });
  if (prop.disponibleDesde && checkout < prop.disponibleDesde) return NextResponse.json({ error: "FUERA_DE_TEMPORADA" }, { status: 400 });
  if (prop.disponibleHasta && checkin > prop.disponibleHasta) return NextResponse.json({ error: "FUERA_DE_TEMPORADA" }, { status: 400 });

  // Solape con otras reservas vivas del mismo piso
  const clash = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.propertyId, propertyId),
        sql`${bookings.status} in ('pending','confirmed')`,
        sql`${bookings.checkin} < ${checkout}`,
        sql`${bookings.checkout} > ${checkin}`
      )
    )
    .limit(1);
  if (clash.length > 0) return NextResponse.json({ error: "NO_DISPONIBLE" }, { status: 409 });

  const [created] = await db
    .insert(bookings)
    .values({ propertyId, renterId: me.id, ownerId: prop.ownerId, checkin, checkout, guests, status: "pending" })
    .returning();

  await logAudit({
    actorId: me.id,
    targetUserId: me.id,
    action: "booking.created",
    entity: "booking",
    entityId: created.id,
    meta: { propertyId, checkin, checkout, guests },
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
