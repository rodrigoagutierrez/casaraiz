import { db } from "@/shared/db/client";
import { bookings, reviews } from "./schema";
import { and, count, eq, sql } from "drizzle-orm";

export function isCompleted(b: { status: string; checkout: string }) {
  return b.status === "confirmed" && b.checkout < todayStr();
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Ventana de valoración: desde el checkout hasta 30 días después.
// En la UI se anima a hacerlo en las primeras 24h.
export function reviewWindow(checkout: string) {
  const end = new Date(checkout);
  end.setDate(end.getDate() + 30);
  const now = new Date();
  const opened = checkout < todayStr();
  return { opened, closesAt: end.toISOString().slice(0, 10), urgent: opened && now.getTime() - new Date(checkout).getTime() < 24 * 3600 * 1000 };
}

export async function getPropertyRating(propertyId: string) {
  const [r] = await db
    .select({
      avg: sql<number | null>`avg((coalesce(${reviews.servicio},0)+coalesce(${reviews.comunicacion},0)+coalesce(${reviews.entorno},0)) * 1.0 / nullif(
        (case when ${reviews.servicio} is null then 0 else 1 end +
         case when ${reviews.comunicacion} is null then 0 else 1 end +
         case when ${reviews.entorno} is null then 0 else 1 end), 0))`,
      n: count(),
    })
    .from(reviews)
    .where(and(eq(reviews.propertyId, propertyId), eq(reviews.kind, "to_owner")));
  return { avg: r?.avg !== null && r?.avg !== undefined ? Number(r.avg) : null, count: r?.n ?? 0 };
}

export async function getUserRating(userId: string, kind: "to_owner" | "to_renter") {
  const [r] = await db
    .select({
      avg: sql<number | null>`avg(coalesce(${reviews.servicio}, ${reviews.actitud}, 0) + coalesce(${reviews.comunicacion},0) + coalesce(${reviews.entorno},0))`,
      n: count(),
    })
    .from(reviews)
    .where(and(eq(reviews.targetUserId, userId), eq(reviews.kind, kind)));
  // Media por review = suma criterios / nº criterios respondidos; aproximamos con el nº de criterios del tipo
  const denom = kind === "to_owner" ? 3 : 1;
  return { avg: r?.avg !== null && r?.avg !== undefined ? Number(r.avg) / denom : null, count: r?.n ?? 0 };
}

export async function getPropertyReviews(propertyId: string, limit = 10) {
  return db.select().from(reviews).where(and(eq(reviews.propertyId, propertyId), eq(reviews.kind, "to_owner"))).orderBy(sql`${reviews.createdAt} desc`).limit(limit);
}

// Nota media por lote (para cards sin N+1)
export async function getRatingsForProperties(ids: string[]): Promise<Map<string, { avg: number | null; count: number }>> {
  const map = new Map<string, { avg: number | null; count: number }>();
  if (ids.length === 0) return map;
  const rows = await db
    .select({
      propertyId: reviews.propertyId,
      avg: sql<number | null>`avg((coalesce(${reviews.servicio},0)+coalesce(${reviews.comunicacion},0)+coalesce(${reviews.entorno},0)) * 1.0 / nullif(
        (case when ${reviews.servicio} is null then 0 else 1 end +
         case when ${reviews.comunicacion} is null then 0 else 1 end +
         case when ${reviews.entorno} is null then 0 else 1 end), 0))`,
      n: count(),
    })
    .from(reviews)
    .where(and(eq(reviews.kind, "to_owner"), sql`${reviews.propertyId} in (${sql.join(ids.map((id) => sql`${id}`), sql`, `)})`))
    .groupBy(reviews.propertyId);
  for (const r of rows) {
    if (r.propertyId) map.set(r.propertyId, { avg: r.avg !== null ? Number(r.avg) : null, count: r.n });
  }
  return map;
}

export async function myPendingReviews(userId: string) {
  // Reservas finalizadas donde falta mi valoración (alguna dirección)
  const rows = await db.select().from(bookings).where(
    and(
      sql`${bookings.status} = 'confirmed'`,
      sql`${bookings.checkout} < current_date`,
      sql`${bookings.checkout} > current_date - interval '30 days'`,
      sql`(${bookings.renterId} = ${userId} or ${bookings.ownerId} = ${userId})`
    )
  );
  const out: { booking: typeof rows[number]; needRenter: boolean; needOwner: boolean; urgent: boolean }[] = [];
  for (const b of rows) {
    const existing = await db.select({ kind: reviews.kind }).from(reviews).where(eq(reviews.bookingId, b.id));
    const kinds = new Set(existing.map((e) => e.kind));
    const mine = b.renterId === userId ? "to_owner" : "to_renter";
    if (kinds.has(mine)) continue;
    const w = reviewWindow(b.checkout);
    out.push({
      booking: b,
      needRenter: b.renterId === userId,
      needOwner: b.ownerId === userId,
      urgent: w.urgent,
    });
  }
  return out;
}

export { bookings };
