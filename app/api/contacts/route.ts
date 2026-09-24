import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/shared/db/client";
import { contacts, properties } from "@/shared/db/schema";
import { and, desc, eq, or } from "drizzle-orm";
import { getUserByClerkId } from "@/modules/users/queries";
import { logAudit } from "@/modules/audit/log";

const contactSchema = z.object({
  propertyId: z.string().uuid(),
  message: z.string().min(10).max(1000).optional(),
});

// GET /api/contacts — bandeja propia (como inquilino u owner)
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const me = await getUserByClerkId(userId);
  if (!me) return NextResponse.json({ data: [] });

  const rows = await db
    .select()
    .from(contacts)
    .where(or(eq(contacts.renterId, me.id), eq(contacts.ownerId, me.id)))
    .orderBy(desc(contacts.createdAt))
    .limit(50);

  return NextResponse.json({ data: rows });
}

// POST /api/contacts — requiere login + membresía activa
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const parsed = contactSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "DATOS_INVALIDOS" }, { status: 400 });

  const me = await getUserByClerkId(userId);
  if (!me) return NextResponse.json({ error: "SIN_PERFIL" }, { status: 404 });
  // Inquilinos gratis: basta con estar registrado. Publicar sigue exigiendo plan de dueño.

  const [prop] = await db.select().from(properties).where(eq(properties.id, parsed.data.propertyId)).limit(1);
  if (!prop || prop.status !== "active") {
    return NextResponse.json({ error: "PISO_NO_DISPONIBLE" }, { status: 404 });
  }
  if (prop.ownerId === me.id) {
    return NextResponse.json({ error: "ES_TU_PISO" }, { status: 400 });
  }

  const dup = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.propertyId, prop.id), eq(contacts.renterId, me.id)))
    .limit(1);
  if (dup.length > 0) return NextResponse.json({ data: dup[0], duplicate: true });

  const [created] = await db
    .insert(contacts)
    .values({
      propertyId: prop.id,
      renterId: me.id,
      ownerId: prop.ownerId,
      message: parsed.data.message,
    })
    .returning();

  await logAudit({
    actorId: me.id,
    targetUserId: me.id,
    action: "contact.sent",
    entity: "contact",
    entityId: created.id,
    meta: { propertyId: prop.id, ownerId: prop.ownerId },
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
