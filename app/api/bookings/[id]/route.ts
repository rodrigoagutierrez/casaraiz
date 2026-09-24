import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/shared/db/client";
import { bookings } from "@/modules/bookings/schema";
import { and, eq } from "drizzle-orm";
import { getUserByClerkId } from "@/modules/users/queries";
import { logAudit } from "@/modules/audit/log";

// PATCH /api/bookings/[id] { decision: "confirmed" | "declined" | "canceled" }
// El dueño confirma/rechaza; el inquilino puede cancelar la suya.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const parsed = z.object({ decision: z.enum(["confirmed", "declined", "canceled"]) }).safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "DATOS_INVALIDOS" }, { status: 400 });

  const me = await getUserByClerkId(userId);
  if (!me) return NextResponse.json({ error: "SIN_PERFIL" }, { status: 404 });

  const { id } = await params;
  const [b] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  if (!b) return NextResponse.json({ error: "NO_ENCONTRADA" }, { status: 404 });

  const isOwner = b.ownerId === me.id;
  const isRenter = b.renterId === me.id;
  if (!isOwner && !isRenter) return NextResponse.json({ error: "NO_AUTORIZADO" }, { status: 403 });
  if (b.status !== "pending") return NextResponse.json({ error: "YA_DECIDIDA" }, { status: 400 });
  if ((parsed.data.decision === "confirmed" || parsed.data.decision === "declined") && !isOwner) {
    return NextResponse.json({ error: "SOLO_DUENO" }, { status: 403 });
  }
  if (parsed.data.decision === "canceled" && !isRenter) {
    return NextResponse.json({ error: "SOLO_INQUILINO" }, { status: 403 });
  }

  const [updated] = await db
    .update(bookings)
    .set({ status: parsed.data.decision })
    .where(and(eq(bookings.id, id), eq(bookings.status, "pending")))
    .returning();

  await logAudit({
    actorId: me.id,
    targetUserId: isOwner ? b.renterId : b.ownerId,
    action: "booking.decided",
    entity: "booking",
    entityId: id,
    meta: { decision: parsed.data.decision },
  });

  return NextResponse.json({ data: updated });
}
