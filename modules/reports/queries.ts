import { db } from "@/shared/db/client";
import { bookings } from "@/modules/bookings/schema";
import { properties } from "@/modules/properties/schema";
import { subscriptions } from "@/modules/billing/schema";
import { users } from "@/modules/users/schema";
import { and, count, desc, eq } from "drizzle-orm";
import { eur } from "@/shared/utils/format";

export function nightsBetween(checkin: string, checkout: string): number {
  const a = new Date(checkin).getTime();
  const b = new Date(checkout).getTime();
  return Math.max(0, Math.round((b - a) / 86400000));
}

const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function monthKey(date: string): string {
  return date.slice(0, 7); // "2026-09"
}

export function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return `${MONTHS_ES[Number(m) - 1]} ${y}`;
}

export type OwnerBookingRow = {
  id: string;
  checkin: string;
  checkout: string;
  guests: number;
  status: string;
  title: string;
  slug: string;
  priceCents: number;
  nights: number;
  revenueCents: number;
};

// Reservas confirmadas de las propiedades del dueño (base de ocupación/ganancias)
export async function getOwnerBookingsReport(ownerId: string): Promise<OwnerBookingRow[]> {
  const rows = await db
    .select({
      id: bookings.id,
      checkin: bookings.checkin,
      checkout: bookings.checkout,
      guests: bookings.guests,
      status: bookings.status,
      title: properties.title,
      slug: properties.slug,
      priceCents: properties.priceCents,
    })
    .from(bookings)
    .innerJoin(properties, eq(bookings.propertyId, properties.id))
    .where(and(eq(properties.ownerId, ownerId), eq(bookings.status, "confirmed")))
    .orderBy(desc(bookings.checkin));

  return rows.map((r) => ({
    ...r,
    nights: nightsBetween(r.checkin, r.checkout),
    revenueCents: nightsBetween(r.checkin, r.checkout) * r.priceCents,
  }));
}

export function summarizeOwner(rows: OwnerBookingRow[]) {
  const totalNights = rows.reduce((a, r) => a + r.nights, 0);
  const totalRevenue = rows.reduce((a, r) => a + r.revenueCents, 0);
  const avgNight = totalNights > 0 ? totalRevenue / totalNights : 0;

  // Por mes (check-in)
  const byMonth = new Map<string, { nights: number; bookings: number; revenue: number }>();
  // Por día de la semana (check-in)
  const dow = new Map<string, number>();

  for (const r of rows) {
    const k = monthKey(r.checkin);
    const m = byMonth.get(k) ?? { nights: 0, bookings: 0, revenue: 0 };
    m.nights += r.nights;
    m.bookings += 1;
    m.revenue += r.revenueCents;
    byMonth.set(k, m);

    const d = new Date(r.checkin).getDay();
    const names = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
    const dn = names[d];
    dow.set(dn, (dow.get(dn) ?? 0) + 1);
  }

  const months = Array.from(byMonth.entries())
    .map(([k, v]) => ({ key: k, label: monthLabel(k), ...v, avgNight: v.nights > 0 ? v.revenue / v.nights : 0 }))
    .sort((a, b) => a.key.localeCompare(b.key));

  const dowArr = Array.from(dow.entries()).map(([d, n]) => ({ day: d, count: n })).sort((a, b) => b.count - a.count);

  return {
    totalBookings: rows.length,
    totalNights,
    totalRevenueCents: totalRevenue,
    avgNightCents: avgNight,
    months,
    dow: dowArr,
  };
}

// ===== SUPERADMIN =====

export async function getSubscriptionReport() {
  const subs = await db
    .select({
      id: subscriptions.id,
      plan: subscriptions.plan,
      status: subscriptions.status,
      kind: subscriptions.kind,
      origin: subscriptions.origin,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      createdAt: subscriptions.createdAt,
      email: users.email,
    })
    .from(subscriptions)
    .leftJoin(users, eq(subscriptions.userId, users.id))
    .orderBy(desc(subscriptions.createdAt))
    .limit(500);

  return subs;
}

export async function getPlatformTotals() {
  const [[owners], [renters], [props], [bks], [subsActive], [subsSeasonal]] = await Promise.all([
    db.select({ n: count() }).from(users).where(eq(users.role, "owner")),
    db.select({ n: count() }).from(users).where(eq(users.role, "renter")),
    db.select({ n: count() }).from(properties).where(eq(properties.status, "active")),
    db.select({ n: count() }).from(bookings).where(eq(bookings.status, "confirmed")),
    db.select({ n: count() }).from(subscriptions).where(eq(subscriptions.status, "active")),
    db.select({ n: count() }).from(subscriptions).where(and(eq(subscriptions.kind, "seasonal"), eq(subscriptions.status, "active"))),
  ]);

  return { owners: owners.n, renters: renters.n, properties: props.n, bookings: bks.n, activeSubs: subsActive.n, seasonalSubs: subsSeasonal.n };
}

// Ingresos estimados por reservas (plataforma) por mes
export async function getPlatformRevenueByMonth() {
  const rows = await db
    .select({
      checkin: bookings.checkin,
      checkout: bookings.checkout,
      priceCents: properties.priceCents,
    })
    .from(bookings)
    .innerJoin(properties, eq(bookings.propertyId, properties.id))
    .where(eq(bookings.status, "confirmed"));

  const byMonth = new Map<string, { nights: number; bookings: number; revenue: number }>();
  for (const r of rows) {
    const n = nightsBetween(r.checkin, r.checkout);
    const k = monthKey(r.checkin);
    const m = byMonth.get(k) ?? { nights: 0, bookings: 0, revenue: 0 };
    m.nights += n;
    m.bookings += 1;
    m.revenue += n * r.priceCents;
    byMonth.set(k, m);
  }
  return Array.from(byMonth.entries())
    .map(([key, v]) => ({ key, label: monthLabel(key), ...v }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

export { eur };
