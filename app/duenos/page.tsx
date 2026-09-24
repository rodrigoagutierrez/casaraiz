import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/shared/db/client";
import { properties } from "@/shared/db/schema";
import { desc, eq } from "drizzle-orm";
import { getUserByClerkId } from "@/modules/users/queries";
import { getPublishCapacity } from "@/modules/billing/plans";
import { eur } from "@/shared/utils/format";

export default async function Duenos() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const me = await getUserByClerkId(userId);
  if (!me) redirect("/sign-in");
  const [rows, cap] = await Promise.all([
    db.select().from(properties).where(eq(properties.ownerId, me.id)).orderBy(desc(properties.createdAt)).limit(100),
    getPublishCapacity(me.id),
  ]);

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
          <Link href="/publicar" className="rounded-full bg-coral-500 px-6 py-3 font-medium text-white hover:bg-coral-600">
            + Publicar piso
          </Link>
        ) : (
          <Link href="/precios" className="rounded-full bg-mar-900 px-6 py-3 font-medium text-white hover:bg-mar-800">
            {cap.hasRights ? "Ampliar capacidad" : "Ver planes de dueño"}
          </Link>
        )}
      </div>

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
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photos[0]} alt={p.title} className="aspect-[16/9] w-full object-cover" />
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
