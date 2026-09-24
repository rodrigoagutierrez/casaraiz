import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/shared/db/client";
import { properties } from "@/shared/db/schema";
import { and, eq } from "drizzle-orm";
import { getUserByClerkId } from "@/modules/users/queries";
import { geocodeSpain } from "@/modules/properties/geocode";
import { logAudit } from "@/modules/audit/log";

const patchSchema = z.object({
  title: z.string().min(10).max(120).optional(),
  description: z.string().min(30).max(2000).optional(),
  priceEur: z.number().min(200).max(15000).optional(),
  rooms: z.number().int().min(0).max(12).optional(),
  baths: z.number().int().min(1).max(6).optional(),
  m2: z.number().int().min(15).max(1000).optional(),
  address: z.string().max(200).optional(),
  barrio: z.string().min(2).max(60).optional(),
  city: z.string().min(2).max(80).optional(),
  entorno: z.enum(["playa", "montana", "bosque", "ciudad", "rio"]).optional(),
  photos: z.array(z.string().url()).max(12).optional(),
  status: z.enum(["draft", "active", "rented"]).optional(),
});

// PATCH /api/properties/[id] — solo el dueño edita su piso
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const me = await getUserByClerkId(userId);
  if (!me) return NextResponse.json({ error: "SIN_PERFIL" }, { status: 404 });

  const { id } = await params;
  const [prop] = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  if (!prop || prop.ownerId !== me.id) {
    return NextResponse.json({ error: "NO_AUTORIZADO" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "DATOS_INVALIDOS" }, { status: 400 });
  const { priceEur, city, barrio, ...rest } = parsed.data;

  const patch: Record<string, unknown> = {
    ...rest,
    ...(priceEur !== undefined ? { priceCents: Math.round(priceEur * 100) } : {}),
    ...(city !== undefined ? { city } : {}),
    ...(barrio !== undefined ? { barrio: barrio.trim().toLowerCase() } : {}),
  };
  if (city !== undefined || barrio !== undefined) {
    const geo = await geocodeSpain(city ?? prop.city, barrio ?? prop.barrio);
    if (geo) {
      patch.lat = geo.lat;
      patch.lng = geo.lng;
    }
  }

  const [updated] = await db
    .update(properties)
    .set(patch)
    .where(and(eq(properties.id, id), eq(properties.ownerId, me.id)))
    .returning();

  await logAudit({
    actorId: me.id,
    targetUserId: me.id,
    action: "property.updated",
    entity: "property",
    entityId: id,
    meta: { fields: Object.keys(parsed.data) },
  });

  return NextResponse.json({ data: updated });
}
