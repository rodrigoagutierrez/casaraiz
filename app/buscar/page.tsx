import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/shared/db/client";
import { properties } from "@/shared/db/schema";
import { reviews } from "@/modules/bookings/schema";
import { and, asc, desc, eq, gte, ilike, isNull, lte, or, sql, type SQL } from "drizzle-orm";
import { getRatingsForProperties } from "@/modules/bookings/queries";
import PropertyCard from "@/modules/properties/components/PropertyCard";
import FiltersBar from "@/modules/properties/components/FiltersBar";
import CategoryRow from "@/modules/properties/components/CategoryRow";

export const metadata: Metadata = {
  title: "Buscar alquiler sin comisión en España | CasaRaiz",
  description: "Filtra por ciudad, zona, habitaciones y precio. Contacto directo con dueños.",
};

type Params = { city?: string; barrio?: string; entorno?: string; habs?: string; baths?: string; min?: string; max?: string; m2?: string; q?: string; orden?: string; desde?: string; hasta?: string; huespedes?: string };

export default async function Buscar({ searchParams }: { searchParams: Promise<Params> }) {
  const { city, barrio, entorno, habs, baths, min, max, m2, q, orden, desde, hasta, huespedes } = await searchParams;
  const filters: SQL[] = [eq(properties.status, "active")];
  if (city) filters.push(ilike(properties.city, `%${city}%`));
  if (barrio) filters.push(ilike(properties.barrio, `%${barrio}%`));
  if (huespedes && Number(huespedes) > 0) filters.push(gte(properties.maxHuespedes, Number(huespedes)));
  // Ventana del dueño: solo pisos disponibles en las fechas pedidas (sin fechas = siempre disponible)
  if (desde) filters.push(or(isNull(properties.disponibleHasta), gte(properties.disponibleHasta, desde))!);
  if (hasta) filters.push(or(isNull(properties.disponibleDesde), lte(properties.disponibleDesde, hasta))!);
  if (entorno) filters.push(eq(properties.entorno, entorno));
  if (habs && Number(habs) > 0) filters.push(gte(properties.rooms, Number(habs)));
  if (baths && Number(baths) > 0) filters.push(gte(properties.baths, Number(baths)));
  if (min && Number(min) > 0) filters.push(gte(properties.priceCents, Math.round(Number(min) * 100)));
  if (max && Number(max) > 0) filters.push(lte(properties.priceCents, Math.round(Number(max) * 100)));
  if (m2 && Number(m2) > 0) filters.push(gte(properties.m2, Number(m2)));
  if (q) filters.push(or(ilike(properties.title, `%${q}%`), ilike(properties.description, `%${q}%`))!);

  // Por defecto: mejores puntuadas primero (nota media de inquilinos), luego novedades
  const ratingAvg = sql<number | null>`avg((coalesce(${reviews.servicio},0)+coalesce(${reviews.comunicacion},0)+coalesce(${reviews.entorno},0)) * 1.0 / nullif(
    (case when ${reviews.servicio} is null then 0 else 1 end +
     case when ${reviews.comunicacion} is null then 0 else 1 end +
     case when ${reviews.entorno} is null then 0 else 1 end), 0))`;

  let rows: typeof properties.$inferSelect[] = [];
  try {
    if (!orden || orden === "destacados") {
      const ranked = await db
        .select({ p: properties, avg: ratingAvg })
        .from(properties)
        .leftJoin(reviews, and(eq(reviews.propertyId, properties.id), eq(reviews.kind, "to_owner")))
        .where(and(...filters))
        .groupBy(properties.id)
        .orderBy(sql`${ratingAvg} desc nulls last`, desc(properties.createdAt))
        .limit(48);
      rows = ranked.map((r) => r.p);
    } else {
      const order =
        orden === "baratos" ? asc(properties.priceCents)
        : orden === "caros" ? desc(properties.priceCents)
        : orden === "grandes" ? desc(properties.m2)
        : desc(properties.createdAt);
      rows = await db.select().from(properties).where(and(...filters)).orderBy(order).limit(48);
    }
  } catch {
    rows = [];
  }

  const ratings = await getRatingsForProperties(rows.map((x) => x.id)).catch(() => new Map());

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold text-mar-950">Encuentra tu temporal en España</h1>
      <Suspense>
        <CategoryRow />
        <FiltersBar />
      </Suspense>
      <p className="mt-4 text-sm text-mar-950/55">
        {rows.length} resultado{rows.length === 1 ? "" : "s"}
        {city ? ` en ${city}` : " en España"}
        {barrio ? ` · zona ${barrio}` : ""}
        {desde || hasta ? ` · ${desde || "…"} → ${hasta || "…"}` : ""}
        {huespedes ? ` · ${huespedes} huésp.` : ""}
        {" · "}<Link href="/mapa" className="font-medium text-mar-700 underline">ver en mapa</Link>
      </p>
      {rows.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => (
            <PropertyCard key={p.id} p={{ slug: p.slug, title: p.title, priceCents: p.priceCents, rooms: p.rooms, m2: p.m2, barrio: p.barrio, maxHuespedes: p.maxHuespedes, photos: p.photos, rating: ratings.get(p.id) }} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-mar-100 bg-white p-8 text-center">
          <p className="font-medium text-mar-900">Sin resultados con esos filtros.</p>
          <p className="mt-1 text-sm text-mar-950/55">Prueba ampliando precio o cambiando de barrio.</p>
        </div>
      )}
    </main>
  );
}
