import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/shared/db/client";
import { properties, users } from "@/shared/db/schema";
import { bookings } from "@/modules/bookings/schema";
import { desc, eq } from "drizzle-orm";
import { getUserByClerkId } from "@/modules/users/queries";
import { myPendingReviews } from "@/modules/bookings/queries";
import { DecisionButtons } from "@/modules/bookings/components/DecisionButtons";
import ReviewForm from "@/modules/bookings/components/ReviewForm";
import PayGarantiaButton from "./PayGarantiaButton";
import { eur } from "@/shared/utils/format";

import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: false } };
const STATUS: Record<string, string> = {
  pending: "Pendiente de confirmación",
  confirmed: "Confirmada",
  declined: "Rechazada",
  canceled: "Cancelada",
};

export default async function Reservas({ searchParams }: { searchParams: Promise<{ garantia?: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const me = await getUserByClerkId(userId);
  if (!me) redirect("/sign-in");
  const { garantia } = await searchParams;

  // Visita a la página: las decisiones posteriores vuelven a pintar el badge.
  await db.update(users).set({ bookingsSeenAt: new Date() }).where(eq(users.id, me.id));

  const rows = await db.select().from(bookings).where(eq(bookings.renterId, me.id)).orderBy(desc(bookings.createdAt)).limit(100);
  const props = await db.select().from(properties);
  const propById = new Map(props.map((p) => [p.id, p]));
  const owners = await db.select().from(users);
  const ownerById = new Map(owners.map((u) => [u.id, u]));

  const pending = await myPendingReviews(me.id).catch(() => []);
  const mine = pending.filter((p) => p.needRenter);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold text-mar-950">Mis reservas</h1>

      {garantia === "ok" && (
        <p className="mt-4 rounded-2xl bg-green-100 p-4 text-sm text-green-800">
          ✓ Pago de la garantía recibido. Quedará activa al confirmarse.
        </p>
      )}

      {mine.length > 0 && (
        <section className="mt-6 rounded-2xl border border-otono-600 bg-otono-100/40 p-5">
          <p className="font-semibold text-mar-900">Valora tus estancias finalizadas</p>
          <p className="text-xs text-mar-950/60">Te lo pedimos en las 24h tras el check-out. Tienes hasta 30 días.</p>
          <div className="mt-3 space-y-3">
            {mine.map(({ booking }) => {
              const p = propById.get(booking.propertyId);
              return (
                <div key={booking.id} className="rounded-xl bg-white p-3">
                  <p className="text-sm font-medium text-mar-900">
                    {p ? <Link href={`/p/${p.slug}`} className="underline">{p.title}</Link> : "Piso"} · {booking.checkin} → {booking.checkout}
                  </p>
                  <ReviewForm bookingId={booking.id} kind="to_owner" />
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-6 space-y-3">
        {rows.length === 0 && <p className="text-sm text-mar-950/55">Sin reservas. <Link href="/buscar" className="underline">Busca tu temporal</Link>.</p>}
        {rows.map((b) => {
          const p = propById.get(b.propertyId);
          const o = ownerById.get(b.ownerId);
          const confirmed = b.status === "confirmed";
          return (
            <div key={b.id} className="rounded-2xl border border-mar-100 bg-white p-4 text-sm">
              <div className="flex items-start gap-3">
                {o?.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={o.photoUrl}
                    alt=""
                    className={`h-10 w-10 shrink-0 rounded-full object-cover ${confirmed ? "" : "blur-[6px]"}`}
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-mar-900">
                    {p ? <Link href={`/p/${p.slug}`} className="underline">{p.title}</Link> : "Piso"}
                    {o?.verificationStatus === "verified" && <span className="ml-1.5 text-xs font-semibold text-green-700">✓ dueño verificado</span>}
                  </p>
                  <p className="mt-1 text-mar-950/65">{b.checkin} → {b.checkout} · {b.guests} huésp. · {STATUS[b.status]}</p>
                </div>
              </div>
              {b.garantiaOptada && (
                <p className="mt-1 text-mar-950/65">
                  Garantía:{" "}
                  {b.garantiaEstado === "pagada" ? (
                    <span className="font-semibold text-green-700">✓ activa</span>
                  ) : (
                    <span>
                      pendiente ({b.garantiaImporteCents ? eur(b.garantiaImporteCents) : "—"}){" "}
                      {b.status === "confirmed" && <PayGarantiaButton bookingId={b.id} />}
                    </span>
                  )}
                </p>
              )}
              {confirmed && o && (
                <div className="mt-2 rounded-xl bg-mar-50 p-3 text-xs text-mar-950/70">
                  <p className="font-medium text-mar-900">Datos de contacto (reserva concretada)</p>
                  <p className="mt-1">
                    {o.email}
                    {o.phone ? ` · ${o.phone}` : ""}
                  </p>
                  {p?.emergencyPhone && (
                    <p className="mt-1">
                      <span className="font-medium text-otono-700">Emergencias:</span> {p.emergencyPhone}
                    </p>
                  )}
                </div>
              )}
              {b.status === "pending" && (
                <div className="mt-2"><DecisionButtons id={b.id} role="renter" /></div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
