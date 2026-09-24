import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/shared/db/client";
import { properties } from "@/shared/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { BARRIOS_VALENCIA, getBarrio } from "@/modules/content/barrios";
import PropertyCard from "@/modules/properties/components/PropertyCard";

export function generateStaticParams() {
  return BARRIOS_VALENCIA.map((b) => ({ barrio: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ barrio: string }>;
}): Promise<Metadata> {
  const { barrio } = await params;
  const b = getBarrio(barrio);
  if (!b) return {};
  return {
    title: `${b.h1} | CasaRaiz Valencia`,
    description: `${b.descripcion} Precio ref: ${b.precioRef}.`,
  };
}

export default async function BarrioPage({
  params,
}: {
  params: Promise<{ barrio: string }>;
}) {
  const { barrio } = await params;
  const b = getBarrio(barrio);
  if (!b) notFound();

  let listings: typeof properties.$inferSelect[] = [];
  try {
    listings = await db
      .select()
      .from(properties)
      .where(and(eq(properties.city, "Valencia"), eq(properties.barrio, barrio), eq(properties.status, "active")))
      .orderBy(desc(properties.createdAt))
      .limit(20);
  } catch {
    listings = [];
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/" className="text-sm text-mar-600">← CasaRaiz</Link>
      <h1 className="mt-4 text-3xl font-bold text-mar-950">{b.h1}</h1>
      <p className="mt-3 text-mar-950/65">{b.descripcion}</p>
      <p className="mt-3 text-sm">
        <span className="rounded-full bg-otono-100 px-3 py-1 font-medium text-otono-700">
          Ref 2hab: {b.precioRef}
        </span>
        <span className="ml-2 text-mar-950/55">{listings.length} publicados</span>
      </p>

      {listings.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {listings.map((p) => (
            <PropertyCard key={p.id} p={{ slug: p.slug, title: p.title, priceCents: p.priceCents, rooms: p.rooms, m2: p.m2, barrio: p.barrio, photos: p.photos }} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-mar-100 bg-white p-6">
          <p className="font-medium text-mar-900">Aún no hay pisos publicados aquí.</p>
          <div className="mt-4">
            <Link href="/publicar" className="rounded-full bg-mar-900 px-5 py-2 text-white text-sm hover:bg-mar-800">
              Publicar en {b.nombre}
            </Link>
          </div>
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-mar-950">Preguntas frecuentes — {b.nombre}</h2>
        <ul className="mt-4 space-y-3 text-sm text-mar-950/70">
          <li><strong className="text-mar-900">¿Hay comisión?</strong> No. Solo los dueños pagan membresía; los inquilinos contactan gratis.</li>
          <li><strong className="text-mar-900">¿Fianza?</strong> En alquiler de temporada (LAU), 2 mensualidades.</li>
          <li><strong className="text-mar-900">¿Contacto directo?</strong> Sí, con membresía activa y DNI verificado.</li>
        </ul>
      </section>
    </main>
  );
}
