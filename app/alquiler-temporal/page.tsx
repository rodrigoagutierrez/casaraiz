import type { Metadata } from "next";
import Link from "next/link";
import { CIUDADES } from "@/modules/content/ciudades";
import { JsonLd } from "@/modules/seo/JsonLd";

export const metadata: Metadata = {
  title: "Alquiler temporal en Valencia sin comisiones",
  description: "Alquiler temporal directo con el dueño en Valencia. Sin comisiones, sin tarifas de servicio.",
  alternates: { canonical: "/alquiler-temporal" },
};

export default function CiudadesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Alquiler temporal en Valencia",
          url: "https://casaraizalquiler.com/alquiler-temporal",
        }}
      />

      <h1 className="text-3xl font-bold text-mar-950">Alquiler temporal en Valencia</h1>
      <p className="mt-3 max-w-2xl text-mar-950/70">
        Elige tu barrio y alquila directo con el dueño. Sin comisiones, sin tarifas de servicio: el precio que ves es el precio real.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CIUDADES.map((c) => {
          const esValencia = c.slug === "valencia";
          return (
            <Link
              key={c.slug}
              href={esValencia ? `/alquiler-temporal/${c.slug}` : "mailto:hola@casaraizalquiler.com?subject=Lista%20de%20espera%20para%20" + encodeURIComponent(c.nombre)}
              className="rounded-2xl border border-mar-100 bg-white p-5 hover:border-mar-200 hover:shadow-lg flex flex-col"
            >
              <p className="text-lg font-semibold text-mar-900">{c.nombre}</p>
              <p className="mt-1 text-sm text-mar-950/65">{c.descripcion.slice(0, 90)}…</p>
              {esValencia ? (
                <p className="mt-2 text-sm font-medium text-otono-700">{c.precioRef}</p>
              ) : (
                <>
                  <p className="mt-2 text-sm text-otono-700 font-medium">Próximamente</p>
                  <p className="text-xs text-mar-950/50 mt-1">Únete a la lista de espera</p>
                </>
              )}
            </Link>
          );
        })}
      </div>

      <section className="mt-10 rounded-3xl bg-mar-900 p-8 text-center text-white">
        <h2 className="text-2xl font-semibold">¿No está tu ciudad?</h2>
        <p className="mx-auto mt-2 max-w-xl text-white/70">
          Por ahora estamos en Valencia. Próximamente en más ciudades.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/propietarios" className="rounded-full bg-otono-600 px-6 py-3 font-medium hover:bg-otono-700">Publicar mi piso</Link>
          <Link href="/buscar" className="rounded-full border border-white/30 px-6 py-3 font-medium hover:bg-white/10">Buscar en Valencia</Link>
        </div>
      </section>
    </main>
  );
}
