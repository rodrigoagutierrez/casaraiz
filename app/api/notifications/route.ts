import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/shared/db/client";
import { conversations, messages } from "@/modules/chat/schema";
import { bookings } from "@/modules/bookings/schema";
import { and, count, eq, gt, or, sql } from "drizzle-orm";
import { getUserByClerkId } from "@/modules/users/queries";

// GET /api/notifications — contadores para los badges del header/mi-cuenta.
// { messages: mensajes no leídos, reservations: solicitudes a decidir (dueño)
//   + decisiones tomadas desde la última visita a /reservas|/duenos }
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const me = await getUserByClerkId(userId);
  if (!me) return NextResponse.json({ data: { messages: 0, reservations: 0 } });

  const [unread, incoming] = await Promise.all([
    db
      .select({ n: count() })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(
        and(
          or(eq(conversations.renterId, me.id), eq(conversations.ownerId, me.id)),
          sql`${messages.senderId} <> ${me.id}`,
          sql`${messages.readAt} is null`
        )
      ),
    // Solicitudes pendientes de decisión (soy el dueño)
    db.select({ n: count() }).from(bookings).where(and(eq(bookings.ownerId, me.id), eq(bookings.status, "pending"))),
  ]);

  // Decisiones ajenas desde mi última visita a las reservas (sin campo "actor":
  // confirmed/declined los hace el dueño; canceled lo hace el inquilino — así
  // nunca se cuenta la propia decisión).
  // bookings_seen_at null = aún no las visitó: no contamos el histórico.
  let decisions = 0;
  if (me.bookingsSeenAt) {
    const [d] = await db
      .select({ n: count() })
      .from(bookings)
      .where(
        and(
          me.role === "renter"
            ? and(eq(bookings.renterId, me.id), sql`${bookings.status} in ('confirmed','declined')`)
            : and(eq(bookings.ownerId, me.id), sql`${bookings.status} = 'canceled'`),
          sql`${bookings.decidedAt} is not null`,
          gt(bookings.decidedAt, me.bookingsSeenAt)
        )
      );
    decisions = d.n;
  }

  return NextResponse.json({
    data: { messages: unread[0]?.n ?? 0, reservations: (incoming[0]?.n ?? 0) + decisions },
  });
}
