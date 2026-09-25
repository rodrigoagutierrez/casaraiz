import Link from "next/link";
import { Suspense } from "react";
import Image from "next/image";
import { db } from "@/shared/db/client";
import { properties } from "@/shared/db/schema";
import { desc, eq } from "drizzle-orm";
import { getRatingsForProperties } from "@/modules/bookings/queries";
import PropertyCard from "@/modules/properties/components/PropertyCard";
import SearchBar from "@/modules/properties/components/SearchBar";
import CategoryRow from "@/modules/properties/components/CategoryRow";
import { BARRIOS_VALENCIA } from "@/modules/content/barrios";
import { CIUDADES } from "@/modules/content/ciudades";
import { getDict } from "@/modules/i18n/server";
import { JsonLd, organizationLd, websiteLd } from "@/modules/seo/JsonLd";

const TOP_BARRIOS = ["ruzafa", "benimaclet", "el-cabanyal", "campanar", "algiros", "pla-del-real"];

export default async function Home() {
  const t = await getDict();

  let destacados: typeof properties.$inferSelect[] = [];
  try {
    destacados = await db
      .select()
      .from(properties)
      .where(eq(properties.status, "active"))
      .orderBy(desc(properties.createdAt))
      .limit(6);
  } catch {
    destacados = [];
  }

  const ratings = await getRatingsForProperties(destacados.map((x) => x.id)).catch(() => new Map());

  return (
    <div className="font-sans">
      <JsonLd data={organizationLd()} />
      <JsonLd data={websiteLd()} />
      {/* Hero */}
      <section className="px-4 pt-4 sm:px-6">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-mar-900">
          <Image
            src="/hero.jpg"
            alt="Casa de alquiler temporal"
            fill
            priority
            sizes="100vw"
            className="kenburns object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65" />
          <div className="relative px-6 pb-20 pt-16 text-center sm:pb-24 sm:pt-24">
            <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
              {t["hero.titulo"]}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-xl text-white/85 sm:text-2xl">
              {t["hero.subtitulo"]}
            </p>
          </div>
          <div className="relative px-4 pb-8 sm:px-8">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="mx-auto max-w-6xl px-6 pt-6">
        <Suspense>
          <CategoryRow />
        </Suspense>
      </section>

      {/* Destacados */}
      <section className="mx-auto max-w-6xl px-6 pt-12">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-mar-950">{t["home.destacados"]}</h2>
          <Link href="/buscar" className="text-sm font-medium text-mar-700 underline">{t["home.verTodos"]}</Link>
        </div>
        {destacados.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {destacados.map((p) => (
              <PropertyCard key={p.id} p={{ slug: p.slug, title: p.title, priceCents: p.priceCents, rooms: p.rooms, m2: p.m2, barrio: p.barrio, maxHuespedes: p.maxHuespedes, photos: p.photos, rating: ratings.get(p.id) }} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-mar-950/55">Pronto verás aquí los pisos destacados.</p>
        )}
      </section>

      {/* Destinos */}
      <section className="mx-auto max-w-6xl px-6 pt-12">
        <h2 className="text-2xl font-semibold text-mar-950">{t["home.destinos"]}</h2>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
          {CIUDADES.slice(0, 6).map((c) => (
            <Link
              key={c.slug}
              href={`/alquiler-temporal/${c.slug}`}
              className="rounded-2xl border border-mar-100 bg-white p-5 hover:border-mar-200 hover:shadow-lg"
            >
              <p className="font-semibold text-mar-900">{c.nombre}</p>
              <p className="text-sm text-mar-950/55">{c.precioRef}</p>
            </Link>
          ))}
        </div>
        <Link href="/buscar" className="mt-4 inline-block text-sm font-medium text-mar-700 underline">
          {t["home.verTodos"]}
        </Link>
      </section>

      {/* Barrios Valencia */}
      <section className="mx-auto max-w-6xl px-6 pt-12">
        <h2 className="text-2xl font-semibold text-mar-950">{t["home.barrios"]}</h2>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
          {BARRIOS_VALENCIA.filter((b) => TOP_BARRIOS.includes(b.slug)).map((b) => (
            <Link
              key={b.slug}
              href={`/alquiler-sin-comision/valencia/${b.slug}`}
              className="rounded-2xl border border-mar-100 bg-white p-5 hover:border-mar-200 hover:shadow-lg"
            >
              <p className="font-semibold text-mar-900">{b.nombre}</p>
              <p className="text-sm text-mar-950/55">{b.precioRef}</p>
            </Link>
          ))}
        </div>
        <Link href="/buscar" className="mt-4 inline-block text-sm font-medium text-mar-700 underline">
          {t["home.verBarrios"].replace("{n}", String(BARRIOS_VALENCIA.length))}
        </Link>
      </section>

      {/* Cómo funciona */}
      <section className="mx-auto max-w-6xl px-6 pt-12">
        <h2 className="text-2xl font-semibold text-mar-950">{t["home.como"]}</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { t: t["home.como1t"], d: t["home.como1d"] },
            { t: t["home.como2t"], d: t["home.como2d"] },
            { t: t["home.como3t"], d: t["home.como3d"] },
          ].map((s) => (
            <div key={s.t} className="rounded-2xl border border-mar-100 bg-white p-5">
              <p className="font-semibold text-mar-900">{s.t}</p>
              <p className="mt-1 text-sm text-mar-950/65">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Planes teaser */}
      <section className="mx-auto max-w-6xl px-6 pt-12">
        <div className="rounded-3xl bg-mar-900 p-8 text-center text-white sm:p-10">
          <h2 className="text-2xl font-semibold">{t["home.planesTitulo"]}</h2>
          <p className="mx-auto mt-2 max-w-xl text-white/70">
            {t["home.planesTexto"]}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/precios" className="rounded-full bg-otono-600 px-6 py-3 font-medium hover:bg-otono-700">
              {t["home.verPlanes"]}
            </Link>
            <Link href="/publicar" className="rounded-full border border-white/30 px-6 py-3 font-medium hover:bg-white/10">
              {t["home.publicarCta"]}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
