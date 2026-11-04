import { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/modules/seo/JsonLd";
import { organizationLd, websiteLd } from "@/modules/seo/JsonLd";

export const metadata: Metadata = {
  title: "Publica tu piso sin comisión · CasaRaiz",
  description:
    "Publica tu piso de alquiler temporal en CasaRaiz sin comisiones de intermediación. Inquilinos gratis, dueños pagan membresía por tramos. Registro NRA y verificación de identidad.",
  alternates: { canonical: "/propietarios" },
  openGraph: {
    title: "Publica tu piso sin comisión · CasaRaiz",
    description: "Inquilinos gratis, dueños pagan membresía por tramos. Sin comisiones de intermediación.",
    url: "https://casaraizalquiler.com/propietarios",
  },
};

export default function PropietariosPage() {
  return (
    <div className="font-sans">
      <JsonLd data={organizationLd()} />
      <JsonLd data={websiteLd()} />
      <section className="px-4 pt-4 sm:px-6">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-mar-900">
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65" />
          <div className="relative px-6 pb-20 pt-16 text-center sm:pb-24 sm:pt-24">
            <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Publica tu piso sin comisión
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-xl text-white/85 sm:text-2xl">
              Inquilinos gratis, dueños pagan membresía. Sin comisiones de intermediación.
            </p>
          </div>
          <div className="relative px-4 pb-8 sm:px-8">
            <Link href="/publicar" className="rounded-full bg-otono-600 px-8 py-3 text-xl font-medium text-white hover:bg-otono-700">
              Publicar mi piso
            </Link>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="mx-auto max-w-6xl px-6 pt-16">
        <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              t: "Sin comisiones por alquiler",
              d: "Conectas directo con el inquilino. Tú pones el precio, tú cobras el alquiler.",
            },
            {
              t: "Planes por tramos",
              d: "Desde 19€/mes para hasta 3 pisos. Plan anual desde 149€/año para hasta 15 pisos.",
            },
            {
              t: "Registro NRA y verificación",
              d: "Te ayudamos con el Registro Único de Arrendamientos (RD 1312/2024) y verificación de identidad.",
            },
          ].map((b) => (
            <div key={b.t} className="rounded-2xl border border-mar-100 bg-white p-6">
              <p className="font-semibold text-mar-900">{b.t}</p>
              <p className="mt-2 text-sm text-mar-950/70">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mx-auto max-w-6xl px-6 pt-16">
        <h2 className="text-2xl font-semibold text-mar-950 mb-6">Cómo funciona para propietarios</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              t: "1. Regístrate",
              d: "Crea tu cuenta de propietario y verifica tu identidad.",
            },
            {
              t: "2. Elige tu plan",
              d: "Suscríbete por tramos según el número de pisos que publiques.",
            },
            {
              t: "3. Publica y contacta",
              d: "Sube tus fotos, publica y recibe contactos de inquilinos verificados.",
            },
          ].map((s) => (
            <div key={s.t} className="rounded-2xl border border-mar-100 bg-white p-6">
              <p className="font-semibold text-mar-900">{s.t}</p>
              <p className="mt-2 text-sm text-mar-950/65">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20">
        <div className="rounded-3xl bg-mar-900 p-8 text-center text-white sm:p-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">¿Listo para publicar?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Crea tu anuncio en minutos y empieza a recibir contactos sin comisiones.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/publicar" className="rounded-full bg-otono-600 px-8 py-3 text-lg font-medium text-white hover:bg-otono-700">
              Publicar mi piso
            </Link>
            <Link href="/precios" className="rounded-full border border-white/30 px-8 py-3 text-lg font-medium hover:bg-white/10">
              Ver planes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
