import { db } from "@/shared/db/client";
import { bookings } from "@/modules/bookings/schema";
import { and, eq, or } from "drizzle-orm";

// ¿Existe una reserva CONCRETADA (confirmed) entre dos usuarios para ese piso?
// Es el desbloqueo de: datos de contacto y foto de perfil nítida.
export async function hasConfirmedBookingBetween(propertyId: string, renterId: string, ownerId: string) {
  const [row] = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.propertyId, propertyId),
        eq(bookings.renterId, renterId),
        eq(bookings.ownerId, ownerId),
        eq(bookings.status, "confirmed")
      )
    )
    .limit(1);
  return !!row;
}

// ¿Hay reserva confirmada entre A y B en CUALQUIER piso? (para el chat/listas,
// donde el desbloqueo no depende de un piso concreto)
export async function confirmedCounterparts(userId: string) {
  const rows = await db
    .select({ renterId: bookings.renterId, ownerId: bookings.ownerId })
    .from(bookings)
    .where(and(eq(bookings.status, "confirmed"), or(eq(bookings.renterId, userId), eq(bookings.ownerId, userId))));
  return new Set(rows.map((r) => (r.renterId === userId ? r.ownerId : r.renterId)));
}
