import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/shared/db/client";
import { properties } from "@/shared/db/schema";
import { createPropertySchema, slugify } from "@/modules/properties/validation";
import { and, desc, eq } from "drizzle-orm";
import { getOrCreateUser } from "@/modules/users/queries";
import { getPublishCapacity } from "@/modules/billing/plans";
import { geocodeSpain } from "@/modules/properties/geocode";
import { logAudit } from "@/modules/audit/log";

// GET /api/properties?barrio=ruzafa&city=Valencia&limit=20
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const barrio = searchParams.get("barrio") ?? undefined;
  const city = searchParams.get("city") ?? undefined;
  const entorno = searchParams.get("entorno") ?? undefined;
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);

  const filters = [eq(properties.status, "active")];
  if (city) filters.push(eq(properties.city, city));
  if (barrio) filters.push(eq(properties.barrio, barrio));
  if (entorno) filters.push(eq(properties.entorno, entorno));

  const rows = await db
    .select()
    .from(properties)
    .where(and(...filters))
    .orderBy(desc(properties.createdAt))
    .limit(limit);

  return NextResponse.json({ data: rows });
}

// POST /api/properties — requiere login + suscripción de dueño con capacidad
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await req.json();
  const parsed = createPropertySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  const client = await clerkClient();
  const cu = await client.users.getUser(userId);
  const email = cu.emailAddresses[0]?.emailAddress ?? `${userId}@casaraiz.local`;
  const owner = await getOrCreateUser(userId, email, "owner");

  const cap = await getPublishCapacity(owner.id);
  if (!cap.hasRights) {
    return NextResponse.json({ error: "NEED_OWNER_PLAN" }, { status: 403 });
  }
  if (!cap.canPublish) {
    return NextResponse.json(
      { error: "LIMIT_REACHED", limit: cap.limit, used: cap.used },
      { status: 403 }
    );
  }

  const [created] = await db
    .insert(properties)
    .values({
      ownerId: owner.id,
      title: input.title,
      description: input.description,
      priceCents: Math.round(input.priceEur * 100),
      rooms: input.rooms,
      baths: input.baths,
      m2: input.m2,
      maxHuespedes: input.maxHuespedes,
      disponibleDesde: input.disponibleDesde ?? null,
      disponibleHasta: input.disponibleHasta ?? null,
      address: input.address,
      city: input.city,
      barrio: input.barrio.trim().toLowerCase(),
      entorno: input.entorno,
      slug: slugify(input.title),
      lat: input.lat,
      lng: input.lng,
      status: "active",
      photos: input.photos,
    })
    .returning();

  // Sitúa el piso en el mapa aunque el dueño no dé coords
  if (!created.lat || !created.lng) {
    const geo = await geocodeSpain(created.city, created.barrio);
    if (geo) {
      await db.update(properties).set({ lat: geo.lat, lng: geo.lng }).where(eq(properties.id, created.id));
      created.lat = geo.lat;
      created.lng = geo.lng;
    }
  }

  await logAudit({
    actorId: owner.id,
    targetUserId: owner.id,
    action: "property.created",
    entity: "property",
    entityId: created.id,
    meta: { slug: created.slug, barrio: created.barrio, priceCents: created.priceCents },
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
