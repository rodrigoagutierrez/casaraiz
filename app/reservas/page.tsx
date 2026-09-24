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

const STATUS: Record<string, string> = {
  pending: "Pendiente de confirmación",
  confirmed: "Confirmada",
  declined: "Rechazada",
  canceled: "Cancelada",
};

export default async function Reservas() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const me = await getUserByClerkId(userId);
  if (!me) redirect("/sign-in");

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
          return (
            <div key={b.id} className="rounded-2xl border border-mar-100 bg-white p-4 text-sm">
              <p className="font-semibold text-mar-900">
                {p ? <Link href={`/p/${p.slug}`} className="underline">{p.title}</Link> : "Piso"}
              </p>
              <p className="mt-1 text-mar-950/65">{b.checkin} → {b.checkout} · {b.guests} huésp. · {STATUS[b.status]}</p>
              {b.status === "confirmed" && o && (
                <p className="mt-1 text-mar-950/65">Dueño: {o.email}{o.phone ? ` · ${o.phone}` : ""}</p>
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
