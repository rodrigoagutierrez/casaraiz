import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/modules/users/queries";
import { getFavoriteProperties } from "@/modules/properties/favorites";
import { getRatingsForProperties } from "@/modules/bookings/queries";
import PropertyCard from "@/modules/properties/components/PropertyCard";

export default async function FavoritosPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const me = await getUserByClerkId(userId);
  if (!me) redirect("/sign-in");

  const rows = await getFavoriteProperties(me.id).catch(() => []);
  const ratings = await getRatingsForProperties(rows.map((r) => r.p.id)).catch(() => new Map());

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold text-mar-950">Mis favoritos</h1>
      <p className="mt-1 text-sm text-mar-950/55">{rows.length} guardados</p>
      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-mar-100 bg-white p-8 text-center">
          <p className="font-medium text-mar-900">Aún no guardas ningún piso.</p>
          <p className="mt-1 text-sm text-mar-950/55">
            Toca el corazón en cualquier anuncio y aparecerá aquí.
          </p>
          <Link href="/buscar" className="mt-4 inline-block rounded-full bg-otono-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-otono-700">
            Buscar pisos
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ p }) => (
            <PropertyCard
              key={p.id}
              p={{ id: p.id, slug: p.slug, title: p.title, priceCents: p.priceCents, rooms: p.rooms, m2: p.m2, barrio: p.barrio, maxHuespedes: p.maxHuespedes, photos: p.photos, rating: ratings.get(p.id), fav: true }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
