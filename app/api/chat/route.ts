import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/shared/db/client";
import { properties } from "@/shared/db/schema";
import { eq } from "drizzle-orm";
import { getUserByClerkId } from "@/modules/users/queries";
import { getOrCreateConversation, listMyConversations } from "@/modules/chat/queries";
import { logAudit } from "@/modules/audit/log";

// GET /api/chat — mis conversaciones
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const me = await getUserByClerkId(userId);
  if (!me) return NextResponse.json({ data: [] });
  const rows = await listMyConversations(me.id);
  return NextResponse.json({ data: rows });
}

// POST /api/chat { propertyId } — crea/obtiene conversación con el dueño del piso
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const parsed = z.object({ propertyId: z.string().uuid() }).safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "DATOS_INVALIDOS" }, { status: 400 });

  const me = await getUserByClerkId(userId);
  if (!me) return NextResponse.json({ error: "SIN_PERFIL" }, { status: 404 });

  const [prop] = await db.select().from(properties).where(eq(properties.id, parsed.data.propertyId)).limit(1);
  if (!prop) return NextResponse.json({ error: "PISO_NO_ENCONTRADO" }, { status: 404 });
  if (prop.ownerId === me.id) return NextResponse.json({ error: "ES_TU_PISO" }, { status: 400 });

  const conv = await getOrCreateConversation(prop.id, me.id, prop.ownerId);
  await logAudit({ actorId: me.id, targetUserId: prop.ownerId, action: "chat.started", entity: "conversation", entityId: conv.id, meta: { propertyId: prop.id } });
  return NextResponse.json({ data: { id: conv.id } }, { status: 201 });
}
