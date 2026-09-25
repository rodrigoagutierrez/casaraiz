import type { Metadata } from "next";
import Link from "next/link";
import { CIUDADES } from "@/modules/content/ciudades";
import { JsonLd } from "@/modules/seo/JsonLd";

export const metadata: Metadata = {
  title: "Alquiler temporal en España sin comisiones | CasaRaiz",
  description: "Alquiler temporal directo con el dueño en las principales ciudades de España: Madrid, Barcelona, Valencia, Sevilla, Málaga y más. Sin comisiones.",
  alternates: { canonical: "/alquiler-temporal" },
};

export default function CiudadesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Alquiler temporal en España",
          url: "https://casaraizalquiler.com/alquiler-temporal",
        }}
      />

      <h1 className="text-3xl font-bold text-mar-950">Alquiler temporal en España</h1>
      <p className="mt-3 max-w-2xl text-mar-950/70">
        Elige tu ciudad y alquila directo con el dueño. Sin comisiones, sin tarifas de servicio:
        el precio que ves es el precio real.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CIUDADES.map((c) => (
          <Link
            key={c.slug}
            href={`/alquiler-temporal/${c.slug}`}
            className="rounded-2xl border border-mar-100 bg-white p-5 hover:border-mar-200 hover:shadow-lg"
          >
            <p className="text-lg font-semibold text-mar-900">{c.nombre}</p>
            <p className="mt-1 text-sm text-mar-950/65">{c.descripcion.slice(0, 90)}…</p>
            <p className="mt-2 text-sm font-medium text-otono-700">{c.precioRef}</p>
          </Link>
        ))}
      </div>

      <section className="mt-10 rounded-3xl bg-mar-900 p-8 text-center text-white">
        <h2 className="text-2xl font-semibold">¿No está tu ciudad?</h2>
        <p className="mx-auto mt-2 max-w-xl text-white/70">
          Publicamos pisos en toda España. Si tu ciudad no aparece, sé el primero en publicar.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/publicar" className="rounded-full bg-otono-600 px-6 py-3 font-medium hover:bg-otono-700">Publicar mi piso</Link>
          <Link href="/buscar" className="rounded-full border border-white/30 px-6 py-3 font-medium hover:bg-white/10">Buscar por ciudad</Link>
        </div>
      </section>
    </main>
  );
}
