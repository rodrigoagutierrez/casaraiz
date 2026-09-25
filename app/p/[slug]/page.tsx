import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/shared/db/client";
import { properties } from "@/shared/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import { eur } from "@/shared/utils/format";
import { entornoLabel } from "@/modules/properties/entornos";
import Map from "@/modules/properties/components/Map";
import ContactBox from "@/modules/contacts/components/ContactBox";
import ChatButton from "@/modules/chat/components/ChatButton";
import BookingBox from "@/modules/bookings/components/BookingBox";
import { Stars } from "@/modules/bookings/components/Stars";
import { getPropertyRating, getPropertyReviews, getUserRating } from "@/modules/bookings/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const [p] = await db.select().from(properties).where(eq(properties.slug, slug)).limit(1);
    if (!p) return {};
    return { title: `${p.title} | CasaRaiz`, description: p.description.slice(0, 150) };
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

  const [rating, reviewList, ownerRating] = await Promise.all([
    getPropertyRating(p.id).catch(() => ({ avg: null as number | null, count: 0 })),
    getPropertyReviews(p.id).catch(() => []),
    getUserRating(p.ownerId, "to_owner").catch(() => ({ avg: null as number | null, count: 0 })),
  ]);

  const photos = p.photos.slice(0, 5);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <Link href={`/alquiler-sin-comision/valencia/${p.barrio}`} className="text-sm text-mar-600">
        ← {p.barrio}
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-mar-950">{p.title}</h1>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <Stars value={rating.avg} />
        <span className="text-sm text-mar-950/55">({rating.count} valoraciones) · Dueño: </span>
        <Stars value={ownerRating.avg} size="text-sm" />
      </div>
      <p className="mt-1 text-sm text-mar-950/55">{p.rooms} hab · {p.baths} baños · {p.m2} m² · hasta {p.maxHuespedes} huésp. · {p.city}</p>
      {p.entorno && (
        <p className="mt-2">
          <span className="rounded-full bg-mar-100 px-3 py-1 text-xs font-medium text-mar-800">
            Entorno: {entornoLabel(p.entorno)}
          </span>
        </p>
      )}

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
          <p className="mt-3 whitespace-pre-line text-mar-950/80">{p.description}</p>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[
              { v: `${p.maxHuespedes}`, l: "Huéspedes" },
              { v: `${p.m2} m²`, l: "Superficie" },
              { v: p.disponibleDesde ? `${p.disponibleDesde}${p.disponibleHasta ? ` → ${p.disponibleHasta}` : ""}` : "Flexible", l: "Disponible" },
            ].map((f) => (
              <div key={f.l} className="rounded-2xl border border-mar-100 bg-white p-4">
                <p className="font-bold capitalize text-mar-900">{f.v}</p>
                <p className="text-xs text-mar-950/55">{f.l}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl font-semibold text-mar-950">Ubicación</h2>
          <div className="mt-3"><Map lat={p.lat} lng={p.lng} title={p.title} /></div>

          <h2 className="mt-8 text-xl font-semibold text-mar-950">
            Valoraciones ({reviewList.length})
          </h2>
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
        </div>

        {/* Tarjeta sticky */}
        <aside>
          <div className="rounded-2xl border border-mar-100 bg-white p-6 shadow-lg lg:sticky lg:top-20">
            <p className="text-2xl font-bold text-mar-900">
              {eur(p.priceCents)}<span className="text-base font-normal text-mar-950/55">/noche</span>
            </p>
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
    </main>
  );
}
