import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/shared/db/client";
import { properties } from "@/shared/db/schema";
import { eq } from "drizzle-orm";
import { eur } from "@/shared/utils/format";
import Map from "@/modules/properties/components/Map";
import ContactBox from "@/modules/contacts/components/ContactBox";

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

  const photos = p.photos.slice(0, 5);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <Link href={`/alquiler-sin-comision/valencia/${p.barrio}`} className="text-sm text-mar-600">
        ← {p.barrio}
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-mar-950">{p.title}</h1>
      <p className="mt-1 text-sm text-mar-950/55">{p.rooms} hab · {p.baths} baños · {p.m2} m² · {p.city}</p>

      {/* Galería mosaico */}
      {photos.length > 0 ? (
        <div className="mt-5 grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[0]} alt={p.title} className="col-span-4 h-64 w-full object-cover sm:col-span-2 sm:row-span-2 sm:h-full sm:min-h-[320px]" />
          {photos.slice(1).map((u, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={u} src={u} alt={`${p.title} ${i + 2}`} className="hidden h-40 w-full object-cover sm:block" />
          ))}
        </div>
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
              { v: `${p.rooms}`, l: "Habitaciones" },
              { v: `${p.m2} m²`, l: "Superficie" },
              { v: p.barrio, l: "Barrio" },
            ].map((f) => (
              <div key={f.l} className="rounded-2xl border border-mar-100 bg-white p-4">
                <p className="font-bold capitalize text-mar-900">{f.v}</p>
                <p className="text-xs text-mar-950/55">{f.l}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl font-semibold text-mar-950">Ubicación</h2>
          <div className="mt-3"><Map lat={p.lat} lng={p.lng} title={p.title} /></div>
        </div>

        {/* Tarjeta sticky */}
        <aside>
          <div className="rounded-2xl border border-mar-100 bg-white p-6 shadow-lg lg:sticky lg:top-20">
            <p className="text-2xl font-bold text-mar-900">
              {eur(p.priceCents)}<span className="text-base font-normal text-mar-950/55">/mes</span>
            </p>
            <p className="mt-1 text-xs text-mar-950/55">Sin comisiones · IVA incluido en membresía</p>
            <div className="mt-4 border-t border-mar-100 pt-4">
              <p className="text-sm font-medium text-mar-900">Contactar dueño directo</p>
              <ContactBox propertyId={p.id} />
            </div>
            <div className="mt-4 rounded-xl bg-mar-50 p-3 text-xs text-mar-950/70">
              <p><strong className="text-mar-900">RGPD:</strong> contacto visible con consentimiento y membresía.</p>
              <p className="mt-1"><strong className="text-mar-900">LAU:</strong> fianza 1 mes, firma Signaturit.</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
