import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/modules/seo/JsonLd";

export const metadata: Metadata = {
  title: "Preguntas frecuentes · Alquiler temporal sin comisión",
  description:
    "Resolvemos tus dudas sobre CasaRaiz: cómo alquilar temporal, fianza, registro de arrendamientos (RD 1312/2024), planes para dueños y más.",
  alternates: { canonical: "/preguntas-frecuentes" },
};

const FAQS = [
  {
    q: "¿Qué es CasaRaiz?",
    a: "CasaRaiz es un marketplace de alquiler temporal (contrato de temporada, LAU art. 3) en Valencia que conecta dueños e inquilinos directamente, sin comisiones de intermediación. Los inquilinos usan la plataforma gratis; los dueños pagan una membresía anual.",
  },
  {
    q: "¿Es gratis para los inquilinos?",
    a: "Sí. Buscar, filtrar, contactar y chatear con el dueño es completamente gratis para el inquilino. Solo necesitas una cuenta verificada (DNI o pasaporte).",
  },
  {
    q: "¿Cuánto cobra CasaRaiz al dueño?",
    a: "El dueño paga una membresía según sus pisos publicados: 19 €/mes (1-3 pisos), 29 €/mes (3-5 pisos) o 149 €/año (hasta 15 pisos). Más de 5 pisos: plan a medida. No hay comisión por alquiler ni por reserva.",
  },
  {
    q: "¿Qué es el alquiler de temporada?",
    a: "Es un contrato de arrendamiento de vivienda de duración limitada por una causa temporal real (estudios, trabajo, obra, motivos médicos), regulado por el art. 3 de la LAU. No es turístico: no requiere licencia VUT ni registro de viajeros.",
  },
  {
    q: "¿Cuánto es la fianza?",
    a: "La fianza legal para temporada es de 2 mensualidades calculadas sobre la renta mensualizada (precio/noche × 30). El dueño debe depositarla en el organismo autonómico en 30 días y devolverla en 1 mes con interés legal.",
  },
  {
    q: "¿Qué es el número de registro (NRA) y por qué aparece en el anuncio?",
    a: "Desde el 01/07/2025, el RD 1312/2024 exige que todo alquiler de corta duración (incluida la temporada) tenga un número de registro para anunciarse en plataformas. CasaRaiz muestra el NRA en cada anuncio y no permite activar un piso sin él.",
  },
  {
    q: "¿Cómo verifico mi identidad?",
    a: "Desde “Mi cuenta” subes foto del DNI o pasaporte (frontal y trasero). En 24-48 h revisamos y te damos el sello de verificado, que aparece en tus anuncios y contactos.",
  },
  {
    q: "¿Puedo cancelar mi membresía?",
    a: "Sí, sin permanencia. Cancelas cuando quieras y mantienes el acceso hasta el fin del periodo pagado, sin renovaciones posteriores. Desistimiento de 14 días naturales desde la contratación (art. 102 TRLGDCU).",
  },
  {
    q: "¿CasaRaiz cobra comisión por reserva?",
    a: "No. CasaRaiz no cobra comisión por alquiler ni por reserva. Solo la membresía recurrente del dueño. El precio que ves es el que pagas.",
  },
  {
    q: "¿Dónde está disponible CasaRaiz?",
    a: "Por ahora en Valencia y sus barrios (Ruzafa, El Cabanyal, Benimaclet, El Carmen y más). Próximamente en más ciudades: únete a la lista de espera escribiendo a hola@casaraizalquiler.com.",
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <JsonLd data={jsonLd} />
      <h1 className="text-3xl font-bold text-mar-950">Preguntas frecuentes</h1>
      <p className="mt-2 text-mar-950/65">
        Resolvemos las dudas más comunes sobre CasaRaiz, el alquiler temporal y las membresías.
      </p>
      <div className="mt-8 space-y-4">
        {FAQS.map((f) => (
          <details key={f.q} className="rounded-2xl border border-mar-100 bg-white p-5">
            <summary className="cursor-pointer font-semibold text-mar-900">{f.q}</summary>
            <p className="mt-2 text-sm text-mar-950/70">{f.a}</p>
          </details>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/buscar" className="rounded-full bg-otono-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-otono-700">
          Buscar piso
        </Link>
        <Link href="/precios" className="rounded-full border border-mar-200 bg-white px-6 py-2.5 text-sm font-medium text-mar-900 hover:bg-mar-50">
          Ver planes
        </Link>
      </div>
    </main>
  );
}
