import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/shared/db/client";
import { properties } from "@/shared/db/schema";
import { and, desc, eq, ilike } from "drizzle-orm";
import { CIUDADES, getCiudad } from "@/modules/content/ciudades";
import PropertyCard from "@/modules/properties/components/PropertyCard";
import { getRatingsForProperties } from "@/modules/bookings/queries";
import { JsonLd } from "@/modules/seo/JsonLd";

export function generateStaticParams() {
  return CIUDADES.map((c) => ({ ciudad: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ ciudad: string }> }): Promise<Metadata> {
  const { ciudad } = await params;
  const c = getCiudad(ciudad);
  if (!c) return {};
  return {
    title: c.titulo,
    description: c.descripcion,
    alternates: { canonical: `/alquiler-temporal/${c.slug}` },
    openGraph: {
      title: c.titulo,
      description: c.descripcion,
    },
  };
}

export default async function CiudadPage({ params }: { params: Promise<{ ciudad: string }> }) {
  const { ciudad } = await params;
  const c = getCiudad(ciudad);
  if (!c) notFound();

  let rows: typeof properties.$inferSelect[] = [];
  try {
    rows = await db
      .select()
      .from(properties)
      .where(and(eq(properties.status, "active"), ilike(properties.city, c.nombre)))
      .orderBy(desc(properties.createdAt))
      .limit(24);
  } catch {
    rows = [];
  }

  const ratings = await getRatingsForProperties(rows.map((p) => p.id)).catch(() => new Map());

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "CasaRaiz", item: "https://casaraizalquiler.com" },
            { "@type": "ListItem", position: 2, name: c.nombre },
          ],
        }}
      />

      <Link href="/" className="text-sm text-mar-600">← CasaRaiz</Link>
      <h1 className="mt-2 text-3xl font-bold text-mar-950">{c.h1}</h1>
      <p className="mt-3 max-w-2xl text-mar-950/70">{c.descripcion}</p>
      <p className="mt-2 text-sm">
        <span className="rounded-full bg-otono-100 px-3 py-1 font-medium text-otono-700">Ref: {c.precioRef}</span>
        <span className="ml-2 text-mar-950/55">{rows.length} disponibles</span>
      </p>

      {/* Zonas populares */}
      <div className="mt-5 flex flex-wrap gap-2">
        {c.zonas.map((z) => (
          <Link
            key={z}
            href={`/buscar?city=${encodeURIComponent(c.nombre)}&barrio=${encodeURIComponent(z.toLowerCase())}`}
            className="rounded-full border border-mar-200 bg-white px-4 py-1.5 text-sm text-mar-900 hover:bg-mar-50"
          >
            {z}
          </Link>
        ))}
      </div>

      {/* Listado */}
      {rows.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => (
            <PropertyCard key={p.id} p={{ slug: p.slug, title: p.title, priceCents: p.priceCents, rooms: p.rooms, m2: p.m2, barrio: p.barrio, maxHuespedes: p.maxHuespedes, photos: p.photos, rating: ratings.get(p.id) }} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-mar-100 bg-white p-8 text-center">
          <p className="font-medium text-mar-900">Aún no hay pisos publicados en {c.nombre}.</p>
          <p className="mt-1 text-sm text-mar-950/55">Sé el primero en publicar sin comisiones.</p>
          <Link href="/publicar" className="mt-4 inline-block rounded-full bg-otono-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-otono-700">
            Publicar en {c.nombre}
          </Link>
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-mar-950">Preguntas frecuentes — {c.nombre}</h2>
        <ul className="mt-3 space-y-2 text-sm text-mar-950/70">
          <li><strong className="text-mar-900">¿Hay comisión?</strong> No. Alquiler temporal directo con el dueño, sin tarifas de servicio.</li>
          <li><strong className="text-mar-900">¿Cuánto cuesta publicar?</strong> Los dueños pagan una membresía por tramos; los inquilinos contactan gratis.</li>
          <li><strong className="text-mar-900">¿Qué precio tienen?</strong> Referencia {c.precioRef} según zona y temporada.</li>
        </ul>
      </section>
    </main>
  );
}
