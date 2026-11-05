import { Metadata } from "next";
import Link from "next/link";
import { getDict } from "@/modules/i18n/server";
import { JsonLd } from "@/modules/seo/JsonLd";
import { organizationLd, websiteLd } from "@/modules/seo/JsonLd";
import SavingsSimulator from "./SavingsSimulator";

export const metadata: Metadata = {
  title: "Publica tu piso sin comisión · CasaRaiz",
  description:
    "Publica tu piso de alquiler temporal en CasaRaiz sin comisiones de intermediación. Inquilinos gratis, dueños pagan membresía por tramos. Mes de prueba gratis.",
  alternates: { canonical: "/propietarios" },
  openGraph: {
    title: "Alquila directo, gana más. Sin comisiones de intermediación.",
    description: "Inquilinos gratis, dueños pagan membresía por tramos. Mes de prueba gratis si publicas hoy.",
    url: "https://casaraizalquiler.com/propietarios",
  },
};

type Plan = {
  t: string;
  precio: string;
  desc: string;
  button: string;
};

type FAQ = {
  q: string;
  a: string;
};

export default async function PropietariosPage() {
  const t = await getDict();

  const planes: Plan[] = [
    {
      t: t["propietarios.plan1.t"],
      precio: t["propietarios.plan1.precio"],
      desc: t["propietarios.plan1.desc"],
      button: "Elegir mensual",
    },
    {
      t: t["propietarios.plan2.t"],
      precio: t["propietarios.plan2.precio"],
      desc: t["propietarios.plan2.desc"],
      button: "Elegir mensual",
    },
    {
      t: t["propietarios.plan3.t"],
      precio: t["propietarios.plan3.precio"],
      desc: t["propietarios.plan3.desc"],
      button: "Elegir anual",
    },
  ];

  const faqs: FAQ[] = [
    {
      q: t["propietarios.faq.q1"],
      a: t["propietarios.faq.a1"],
    },
    {
      q: t["propietarios.faq.q2"],
      a: t["propietarios.faq.a2"],
    },
    {
      q: t["propietarios.faq.q3"],
      a: t["propietarios.faq.a3"],
    },
    {
      q: t["propietarios.faq.q4"],
      a: t["propietarios.faq.a4"],
    },
  ];

  return (
    <div className="font-sans">
      <JsonLd data={organizationLd()} />
      <JsonLd data={websiteLd()} />
      {/* Hero */}
      <section className="px-4 pt-4 sm:px-6">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-mar-900">
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65" />
          <div className="relative px-6 pb-20 pt-16 text-center sm:pb-24 sm:pt-24">
            <span className="inline-block mb-3 px-3 py-1 rounded-full bg-otono-600 text-xs font-medium text-white">
              {t["propietarios.mesPrueba.t"]}
            </span>
            <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
              {t["propietarios.titulo"]}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-xl text-white/85 sm:text-2xl">
              {t["propietarios.subtitulo"]}
            </p>
          </div>
          <div className="relative px-4 pb-8 sm:px-8">
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/publicar" className="rounded-full bg-otono-600 px-8 py-3 text-xl font-medium text-white hover:bg-otono-700">
                {t["propietarios.cta"]}
              </Link>
              <Link href="/precios" className="rounded-full border border-white/30 px-8 py-3 text-lg font-medium hover:bg-white/10">
                Ver planes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Simulador de ahorro */}
      <section className="mx-auto max-w-6xl px-6 pt-16">
        <div className="rounded-2xl border border-mar-100 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-mar-900 mb-2">{t["propietarios.simulador.t"]}</h2>
              <p className="text-sm text-mar-950/60 mb-6">{t["propietarios.simulador.subt"]}</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-mar-900 mb-1">{t["propietarios.simulador.alquiler"]}</label>
                  <input
                    id="precioAlquiler"
                    type="number"
                    min="0"
                    step="50"
                    defaultValue="800"
                    className="w-full rounded-lg border border-mar-200 bg-white px-3 py-1.5 text-sm text-mar-950 outline-none focus:border-mar-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-mar-900 mb-1">{t["propietarios.simulador.pisos"]}</label>
                  <select
                    id="numPisos"
                    className="w-full rounded-lg border border-mar-200 bg-white px-3 py-1.5 text-sm text-mar-950 outline-none focus:border-mar-600"
                  >
                    <option value="1">1 piso</option>
                    <option value="2">2 pisos</option>
                    <option value="3">3 pisos</option>
                    <option value="4">4 pisos</option>
                    <option value="5">5 pisos</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-mar-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-mar-900 mb-4">{t["propietarios.simulador.resultadoCasa"]}</h3>
              <p className="text-2xl font-bold text-mar-900" id="resultadoCasa">0 €/año</p>
              <h3 className="mt-4 text-lg font-semibold text-mar-900 mb-4">{t["propietarios.simulador.resultadoAirbnb"]}</h3>
              <p className="text-2xl font-bold text-otono-700" id="resultadoAirbnb">0 €/año</p>
              <h3 className="mt-4 text-lg font-semibold text-mar-900 mb-4">{t["propietarios.simulador.resultadoBooking"]}</h3>
              <p className="text-2xl font-bold text-otono-700" id="resultadoBooking">0 €/año</p>
              <div className="mt-6 pt-4 border-t border-mar-100">
                <h4 className="text-sm font-semibold text-mar-900">{t["propietarios.simulador.resultadoAhorro"]}</h4>
                <p className="text-3xl font-bold text-otono-600" id="resultadoAhorro">0 €/año</p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-mar-950/50 text-center">
            Cálculo estimado: comisión Airbnb ~3% sobre el alquiler, Booking ~15%. CasaRaiz: solo membresía (19 €/mes hasta 3 pisos, 29 €/mes de 3 a 5, 149 €/año hasta 15).
          </p>
        </div>
      </section>
      <SavingsSimulator />

      {/* Planes */}
      <section className="mx-auto max-w-6xl px-6 pt-16">
        <h2 className="text-2xl font-semibold text-mar-900 mb-8">{t["propietarios.planes.t"]}</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {planes.map((p) => (
            <div key={p.t} className="rounded-2xl border border-mar-100 bg-white p-6 flex flex-col">
              <p className="font-semibold text-mar-900 text-lg">{p.t}</p>
              <p className="mt-2 text-3xl font-bold text-mar-950">
                {p.precio}<span className="text-base font-normal text-mar-950/55 ml-1"></span>
              </p>
              <p className="mt-3 text-sm text-mar-950/70 flex-1">{p.desc}</p>
              <div className="mt-auto pt-4">
                <Link
                  href="/precios"
                  className="w-full rounded-full bg-mar-900 px-4 py-2 text-sm font-medium text-white hover:bg-mar-800"
                >
                  {p.button}
                </Link>
              </div>
            </div>
          ))}
          {planes.length > 0 && (
            <div key="mas" className="rounded-2xl border border-otono-200 bg-otono-50 p-6 flex flex-col">
              <p className="font-semibold text-mar-900 text-lg">{t["propietarios.planMas.t"]}</p>
              <p className="mt-2 text-sm text-mar-950/70 flex-1">{t["propietarios.planMas.desc"]}</p>
              <div className="mt-auto pt-4">
                <a
                  href={`mailto:${t["propietarios.planMas.contacto"]}`}
                  className="w-full rounded-full border border-mar-200 bg-white px-4 py-2 text-sm font-medium text-mar-900 hover:bg-mar-50"
                >
                  {t["propietarios.planMas.contacto"]}
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Registro NRA */}
      <section className="mx-auto max-w-6xl px-6 pt-16 border-t border-mar-100">
        <div className="rounded-2xl border border-mar-100 bg-white p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-mar-900 mb-4">{t["propietarios.registro.t"]}</h2>
          <p className="text-sm text-mar-950/70">{t["propietarios.registro.d"]}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20">
        <h2 className="text-2xl font-semibold text-mar-900 mb-8">{t["propietarios.faq.t"]}</h2>
        <div className="space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="rounded-xl border border-mar-100 bg-white p-5">
              <summary className="cursor-pointer font-semibold text-mar-900 list-none">
                <span>{f.q}</span>
                <span className="ml-2 text-xs text-mar-950/50">▾</span>
              </summary>
              <p className="mt-2 text-sm text-mar-950/70">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
