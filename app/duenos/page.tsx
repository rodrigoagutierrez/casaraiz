import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/shared/db/client";
import { properties, users } from "@/shared/db/schema";
import { bookings } from "@/modules/bookings/schema";
import { and, desc, eq } from "drizzle-orm";
import { getUserByClerkId } from "@/modules/users/queries";
import { getPublishCapacity } from "@/modules/billing/plans";
import { myPendingReviews } from "@/modules/bookings/queries";
import { DecisionButtons } from "@/modules/bookings/components/DecisionButtons";
import ReviewForm from "@/modules/bookings/components/ReviewForm";
import { eur } from "@/shared/utils/format";

export default async function Duenos() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const me = await getUserByClerkId(userId);
  if (!me) redirect("/sign-in");
  const [rows, cap, incoming, toReview] = await Promise.all([
    db.select().from(properties).where(eq(properties.ownerId, me.id)).orderBy(desc(properties.createdAt)).limit(100),
    getPublishCapacity(me.id),
    db.select().from(bookings).where(and(eq(bookings.ownerId, me.id), eq(bookings.status, "pending"))).orderBy(desc(bookings.createdAt)).limit(50),
    myPendingReviews(me.id).catch(() => []),
  ]);
  const renters = await db.select().from(users);
  const renterById = new Map(renters.map((u) => [u.id, u]));
  const propsById = new Map(rows.map((p) => [p.id, p]));
  const needOwner = toReview.filter((p) => p.needOwner);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-mar-950">Mis pisos</h1>
          <p className="mt-1 text-sm text-mar-950/55">
            {cap.hasRights
              ? `Capacidad: ${cap.used}/${cap.limit === null ? "∞" : cap.limit} activos`
              : "Sin suscripción de dueño: no puedes publicar"}
          </p>
        </div>
        {cap.canPublish ? (
          <Link href="/publicar" className="rounded-full bg-otono-600 px-6 py-3 font-medium text-white hover:bg-otono-700">
            + Publicar piso
          </Link>
        ) : (
          <Link href="/precios" className="rounded-full bg-mar-900 px-6 py-3 font-medium text-white hover:bg-mar-800">
            {cap.hasRights ? "Ampliar capacidad" : "Ver planes de dueño"}
          </Link>
        )}
      </div>

      {incoming.length > 0 && (
        <section className="mt-8 rounded-2xl border border-mar-100 bg-white p-5">
          <h2 className="font-semibold text-mar-900">Solicitudes pendientes ({incoming.length})</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {incoming.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-mar-50 p-3">
                <span className="text-mar-900">
                  <strong>{propsById.get(b.propertyId)?.title ?? "Piso"}</strong> · {b.checkin} → {b.checkout} · {b.guests} huésp. · {renterById.get(b.renterId)?.email}
                </span>
                <DecisionButtons id={b.id} role="owner" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {needOwner.length > 0 && (
        <section className="mt-4 rounded-2xl border border-otono-600 bg-otono-100/40 p-5">
          <h2 className="font-semibold text-mar-900">Valora a tus inquilinos</h2>
          <div className="mt-3 space-y-3">
            {needOwner.map(({ booking }) => (
              <div key={booking.id} className="rounded-xl bg-white p-3 text-sm">
                <p className="font-medium text-mar-900">
                  {propsById.get(booking.propertyId)?.title} · {booking.checkin} → {booking.checkout} · {renterById.get(booking.renterId)?.email}
                </p>
                <ReviewForm bookingId={booking.id} kind="to_renter" />
              </div>
            ))}
          </div>
        </section>
      )}

      {rows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-mar-100 bg-white p-8 text-center">
          <p className="font-medium text-mar-900">Aún no tienes pisos.</p>
          <p className="mt-1 text-sm text-mar-950/55">Publica el primero y empieza a recibir contactos directos.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              {p.photos[0] ? (
                <span className="relative block aspect-[16/9] w-full bg-mar-100">
                  <Image src={p.photos[0]} alt={p.title} fill loading="lazy" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                </span>
              ) : (
                <div className="flex aspect-[16/9] w-full items-center justify-center bg-mar-100 text-sm text-mar-700">Sin fotos</div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold text-mar-900">{p.title}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${p.status === "active" ? "bg-green-100 text-green-800" : "bg-mar-100 text-mar-800"}`}>
                    {p.status === "active" ? "Activo" : p.status === "rented" ? "Alquilado" : "Borrador"}
                  </span>
                </div>
                <p className="mt-1 font-bold text-mar-900">{eur(p.priceCents)}<span className="text-sm font-normal text-mar-950/55">/mes</span></p>
                <div className="mt-3 flex gap-2">
                  <Link href={`/duenos/pisos/${p.id}/editar`} className="rounded-full border border-mar-200 px-4 py-1.5 text-sm text-mar-900 hover:bg-mar-50">
                    Editar
                  </Link>
                  <Link href={`/p/${p.slug}`} className="rounded-full border border-mar-200 px-4 py-1.5 text-sm text-mar-900 hover:bg-mar-50">
                    Ver ficha
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
