import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/shared/db/client";
import { favorites, properties } from "@/shared/db/schema";
import { and, eq } from "drizzle-orm";
import { getUserByClerkId } from "@/modules/users/queries";

// GET /api/favoritos — ids de mis favoritos (para pintar corazones)
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ data: [] });
  const me = await getUserByClerkId(userId);
  if (!me) return NextResponse.json({ data: [] });
  const rows = await db.select({ propertyId: favorites.propertyId }).from(favorites).where(eq(favorites.userId, me.id));
  return NextResponse.json({ data: rows.map((r) => r.propertyId) });
}

// POST /api/favoritos { propertyId } — toggle, devuelve { favorited }
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const parsed = z.object({ propertyId: z.string().uuid() }).safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "DATOS_INVALIDOS" }, { status: 400 });

  const me = await getUserByClerkId(userId);
  if (!me) return NextResponse.json({ error: "SIN_PERFIL" }, { status: 404 });

  const [prop] = await db.select({ id: properties.id }).from(properties).where(eq(properties.id, parsed.data.propertyId)).limit(1);
  if (!prop) return NextResponse.json({ error: "NO_ENCONTRADO" }, { status: 404 });

  const [existing] = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, me.id), eq(favorites.propertyId, prop.id)))
    .limit(1);

  if (existing) {
    await db.delete(favorites).where(and(eq(favorites.userId, me.id), eq(favorites.propertyId, prop.id)));
    return NextResponse.json({ favorited: false });
  }
  await db.insert(favorites).values({ userId: me.id, propertyId: prop.id });
  return NextResponse.json({ favorited: true }, { status: 201 });
}

// DELETE /api/favoritos?propertyId= — quitar
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const me = await getUserByClerkId(userId);
  if (!me) return NextResponse.json({ error: "SIN_PERFIL" }, { status: 404 });

  const propertyId = new URL(req.url).searchParams.get("propertyId");
  if (!propertyId) return NextResponse.json({ error: "DATOS_INVALIDOS" }, { status: 400 });
  await db.delete(favorites).where(and(eq(favorites.userId, me.id), eq(favorites.propertyId, propertyId)));
  return NextResponse.json({ favorited: false });
}
