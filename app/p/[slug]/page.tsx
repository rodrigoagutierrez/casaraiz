import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/shared/db/client";
import { properties, users } from "@/shared/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import { eur } from "@/shared/utils/format";
import { getUserByClerkId } from "@/modules/users/queries";
import { getFavoriteIds } from "@/modules/properties/favorites";
import { entornoLabel } from "@/modules/properties/entornos";
import Map from "@/modules/properties/components/Map";
import ContactBox from "@/modules/contacts/components/ContactBox";
import ChatButton from "@/modules/chat/components/ChatButton";
import BookingBox from "@/modules/bookings/components/BookingBox";
import FavButton from "@/modules/properties/components/FavButton";
import { Stars } from "@/modules/bookings/components/Stars";
import { getPropertyRating, getPropertyReviews } from "@/modules/bookings/queries";
import DescriptionBlock from "@/modules/properties/components/DescriptionBlock";
import { JsonLd } from "@/modules/seo/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const [p] = await db.select().from(properties).where(eq(properties.slug, slug)).limit(1);
    if (!p) return {};
    const price = p.priceCents / 100;
    return {
      title: `${p.title} en ${p.city} · ${price.toFixed(0)}€/noche`,
      description: p.description.slice(0, 160),
      alternates: { canonical: `/p/${p.slug}` },
      openGraph: {
        title: `${p.title} · ${price.toFixed(0)}€/noche | CasaRaiz`,
        description: p.description.slice(0, 160),
        images: p.photos[0] ? [{ url: p.photos[0] }] : [],
      },
    };
  } catch {
    return {};
  }
}

export default async function PisoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let p: typeof properties.$inferSelect | undefined;
  try {
    [p] = await db.select().from(properties).where(eq(properties.slug, slug)).limit(1);
  } catch {
    p = undefined;
  }
  if (!p) notFound();

  const [rating, reviewList, ownerRows] = await Promise.all([
    getPropertyRating(p.id).catch(() => ({ avg: null as number | null, count: 0 })),
    getPropertyReviews(p.id).catch(() => []),
    db.select({ dniVerified: users.dniVerified }).from(users).where(eq(users.id, p.ownerId)).limit(1).catch(() => []),
  ]);
  const ownerVerified = ownerRows[0]?.dniVerified ?? false;

  const avgOf = (key: "servicio" | "comunicacion" | "entorno") => {
    const vals = reviewList.map((r) => r[key]).filter((x): x is number => x !== null);
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };
  const breakdown = [
    { label: "Servicio", value: avgOf("servicio") },
    { label: "Comunicación", value: avgOf("comunicacion") },
    { label: "Entorno", value: avgOf("entorno") },
  ];

  const photos = p.photos.slice(0, 5);

  let fav = false;
  try {
    const { userId } = await auth();
    if (userId) {
      const me = await getUserByClerkId(userId).catch(() => undefined);
      if (me) fav = (await getFavoriteIds(me.id).catch(() => new Set<string>())).has(p.id);
    }
  } catch {}

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 pb-28 md:pb-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LodgingBusiness",
          name: p.title,
          description: p.description,
          image: p.photos,
          address: {
            "@type": "PostalAddress",
            addressLocality: p.city,
            addressRegion: p.barrio,
            addressCountry: "ES",
          },
          amenityFeature: [
            { "@type": "LocationFeatureSpecification", name: "Habitaciones", value: p.rooms },
            { "@type": "LocationFeatureSpecification", name: "Huéspedes", value: p.maxHuespedes },
            { "@type": "LocationFeatureSpecification", name: "Superficie (m²)", value: p.m2 },
          ],
          aggregateRating: rating.avg ? { "@type": "AggregateRating", ratingValue: rating.avg.toFixed(2), reviewCount: rating.count } : undefined,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Offer",
          price: (p.priceCents / 100).toFixed(2),
          priceCurrency: "EUR",
          url: `https://casaraizalquiler.com/p/${p.slug}`,
          availability: p.status === "active" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          validFrom: p.disponibleDesde ?? undefined,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "CasaRaiz", item: "https://casaraizalquiler.com" },
            { "@type": "ListItem", position: 2, name: p.city, item: `https://casaraizalquiler.com/buscar?city=${encodeURIComponent(p.city)}` },
            { "@type": "ListItem", position: 3, name: p.title },
          ],
        }}
      />
      <Link href={`/alquiler-sin-comision/valencia/${p.barrio}`} className="text-sm text-mar-600">
        ← {p.barrio}
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-mar-950">{p.title}</h1>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        {rating.avg !== null && (
          <span className="font-semibold text-mar-900">★ {rating.avg.toFixed(2)}</span>
        )}
        <a href="#valoraciones" className="font-medium text-mar-900 underline">
          ({rating.count} valoraciones)
        </a>
        {ownerVerified && (
          <span className="rounded-full bg-mar-100 px-2.5 py-0.5 text-xs font-semibold text-mar-800">
            ✓ Dueño verificado
          </span>
        )}
        <span className="text-mar-950/55">{p.city}{p.entorno ? ` · ${entornoLabel(p.entorno)}` : ""}</span>
      </div>
      <p className="mt-1 text-sm text-mar-950/55">{p.rooms} hab · {p.baths} baños · {p.m2} m² · hasta {p.maxHuespedes} huésp.</p>

      {/* Galería mosaico */}
      {photos.length > 0 ? (
        <>
          <div className="mt-5 hidden grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl sm:grid">
            <span className="relative col-span-2 row-span-2 min-h-[320px]">
              <Image src={photos[0]} alt={p.title} fill priority sizes="(max-width: 1024px) 100vw, 65vw" className="object-cover" />
            </span>
            {photos.slice(1).map((u, i) => (
              <span key={u} className="relative h-40">
                <Image src={u} alt={`${p.title} ${i + 2}`} fill loading="lazy" sizes="(max-width: 1024px) 50vw, 20vw" className="object-cover" />
              </span>
            ))}
          </div>
          <div className="mt-5 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:hidden">
            {photos.map((u, i) => (
              <span key={u} className="relative aspect-[4/3] w-[85%] shrink-0 snap-center overflow-hidden rounded-2xl">
                <Image src={u} alt={`${p.title} ${i + 1}`} fill loading="lazy" sizes="85vw" className="object-cover" />
              </span>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-5 flex h-56 items-center justify-center rounded-2xl bg-mar-100 text-sm text-mar-700">
          Este piso aún no tiene fotos
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Info */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-mar-950">Sobre este piso</h2>
          <div className="mt-3">
            <DescriptionBlock text={p.description} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3 sm:text-center">
            {[
              { v: `${p.maxHuespedes}`, l: "Huéspedes" },
              { v: `${p.m2} m²`, l: "Superficie" },
              { v: p.disponibleDesde ? `${p.disponibleDesde}${p.disponibleHasta ? ` → ${p.disponibleHasta}` : ""}` : "Flexible", l: "Disponible" },
            ].map((f) => (
              <div key={f.l} className="rounded-2xl border border-mar-100 bg-white p-3 text-sm sm:p-4 sm:text-base">
                <p className="break-words font-bold capitalize text-mar-900">{f.v}</p>
                <p className="text-xs text-mar-950/55">{f.l}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl font-semibold text-mar-950">Ubicación</h2>
          <div className="mt-3"><Map lat={p.lat} lng={p.lng} title={p.title} /></div>

          <h2 id="valoraciones" className="mt-8 flex items-center gap-2 text-xl font-semibold text-mar-950">
            {rating.avg !== null && <span>★ {rating.avg.toFixed(2)}</span>}
            Valoraciones ({reviewList.length})
          </h2>
          {breakdown.some((b) => b.value !== null) && (
            <div className="mt-3 space-y-2 rounded-2xl border border-mar-100 bg-white p-4">
              {breakdown.map((b) => (
                <div key={b.label} className="flex items-center gap-3 text-sm">
                  <span className="w-28 shrink-0 text-mar-900">{b.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-mar-100">
                    <div className="h-full rounded-full bg-otono-600" style={{ width: `${((b.value ?? 0) / 5) * 100}%` }} />
                  </div>
                  <span className="w-8 shrink-0 text-right font-semibold text-mar-900">
                    {b.value !== null ? b.value.toFixed(1) : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
          {reviewList.length === 0 ? (
            <p className="mt-2 text-sm text-mar-950/55">Aún sin valoraciones. Sé el primero en puntuar tras tu estancia.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {reviewList.map((r) => (
                <li key={r.id} className="rounded-2xl border border-mar-100 bg-white p-4 text-sm">
                  <Stars
                    value={
                      [r.servicio, r.comunicacion, r.entorno].filter((x) => x !== null).length > 0
                        ? ([r.servicio, r.comunicacion, r.entorno].filter((x) => x !== null) as number[]).reduce((a, b) => a + b, 0) /
                          [r.servicio, r.comunicacion, r.entorno].filter((x) => x !== null).length
                        : null
                    }
                    size="text-sm"
                  />
                  <p className="mt-1 text-mar-950/70">
                    {[
                      r.servicio !== null && `Servicio ${r.servicio}`,
                      r.comunicacion !== null && `Comunicación ${r.comunicacion}`,
                      r.entorno !== null && `Entorno ${r.entorno}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {r.comment && <p className="mt-1 text-mar-950/80">“{r.comment}”</p>}
                </li>
              ))}
            </ul>
          )}

          <h2 className="mt-8 text-xl font-semibold text-mar-950">Cosas que debes saber</h2>
          <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
            {[
              { t: "Sin comisiones", d: "Hablas directo con el dueño. Lo que ves es lo que pagas." },
              { t: "Fianza 2 meses", d: "Contrato de temporada (LAU). El dueño la deposita en su comunidad." },
              { t: "Contacto verificado", d: "Dueño con identidad verificada y valoraciones reales." },
            ].map((c) => (
              <li key={c.t} className="rounded-2xl border border-mar-100 bg-white p-4">
                <p className="font-semibold text-mar-900">{c.t}</p>
                <p className="mt-1 text-mar-950/65">{c.d}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Tarjeta sticky */}
        <aside id="reserva">
          <div className="rounded-2xl border border-mar-100 bg-white p-6 shadow-lg lg:sticky lg:top-20">
            <div className="flex items-start justify-between gap-3">
              <p className="text-2xl font-bold text-mar-900">
                {eur(p.priceCents)}<span className="text-base font-normal text-mar-950/55">/noche</span>
              </p>
              <FavButton propertyId={p.id} initial={fav} />
            </div>
            <p className="mt-1 text-xs text-mar-950/55">Sin comisiones · IVA incluido en membresía</p>
            <div className="mt-4 border-t border-mar-100 pt-4">
              <p className="text-sm font-medium text-mar-900">Tu estancia temporal</p>
              <BookingBox propertyId={p.id} maxHuespedes={p.maxHuespedes} />
            </div>
            <div className="mt-4 border-t border-mar-100 pt-4">
              <p className="text-sm font-medium text-mar-900">¿Dudas? Habla con el dueño</p>
              <div className="mt-2"><ChatButton propertyId={p.id} /></div>
              <div className="mt-2"><ContactBox propertyId={p.id} /></div>
            </div>
            <div className="mt-4 rounded-xl bg-mar-50 p-3 text-xs text-mar-950/70">
              <p><strong className="text-mar-900">RGPD:</strong> contacto visible con consentimiento y cuenta registrada.</p>
              <p className="mt-1"><strong className="text-mar-900">Temporada:</strong> fianza 2 meses (LAU), firma Signaturit.</p>
            </div>
          </div>
        </aside>
      </div>

      {/* CTA fijo solo móvil */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-mar-100 bg-white/95 px-4 pt-2 backdrop-blur md:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <div className="flex items-center gap-3">
          <p className="font-bold text-mar-900">
            {eur(p.priceCents)}<span className="text-sm font-normal text-mar-950/55">/noche</span>
          </p>
          <a href="#reserva" className="flex h-12 flex-1 items-center justify-center rounded-full bg-otono-600 font-semibold text-white">
            Solicitar reserva
          </a>
        </div>
      </div>
    </main>
  );
}
