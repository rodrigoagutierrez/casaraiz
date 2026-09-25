import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/modules/seo/JsonLd";

export const metadata: Metadata = {
  title: "CasaRaiz vs Airbnb y Booking: alquiler temporal sin comisiones",
  description: "Comparativa: Airbnb y Booking cobran comisión por reserva. En CasaRaiz el inquilino no paga comisión y el dueño solo una membresía. Descubre la diferencia.",
  alternates: { canonical: "/comparativa" },
};

const FILAS = [
  { concepto: "Comisión al inquilino", casa: "0 € (gratis)", airbnb: "hasta ~14%", booking: "0 € (lo paga el dueño)" },
  { concepto: "Coste para el dueño", casa: "Membresía plana (desde 19 €/mes)", airbnb: "~3% por reserva", booking: "~15% por reserva" },
  { concepto: "Contacto directo", casa: "Sí, dueño ↔ inquilino", airbnb: "No (mediado)", booking: "No (mediado)" },
  { concepto: "Precio final", casa: "Sin recargos ocultos", airbnb: "Tarifas de servicio añadidas", booking: "Comisión incluida en el precio" },
  { concepto: "Verificación", casa: "DNI/pasaporte del usuario", airbnb: "Verificación de perfil", booking: "Verificación del establecimiento" },
];

const FAQ = [
  {
    q: "¿Por qué en CasaRaiz el inquilino no paga comisión?",
    a: "Nuestro modelo no cobra por reserva: los dueños pagan una membresía plana por publicar sus pisos. El inquilino contacta y reserva directo, sin tarifas de servicio.",
  },
  {
    q: "¿En qué se diferencia de Airbnb?",
    a: "Airbnb añade una tarifa de servicio al huésped (hasta ~14%) y cobra comisión al anfitrión. En CasaRaiz no hay comisión por reserva: solo la membresía del dueño.",
  },
  {
    q: "¿Y de Booking?",
    a: "Booking carga la comisión al establecimiento (~15%), que normalmente acaba repercutida en el precio. Aquí el precio que ves es el precio real.",
  },
  {
    q: "¿Es seguro alquilar sin intermediario?",
    a: "Sí: verificamos la identidad (DNI o pasaporte), publicamos valoraciones bidireccionales y el contacto queda registrado en la plataforma.",
  },
];

export default function ComparativaPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      <h1 className="text-3xl font-bold text-mar-950 sm:text-4xl">
        CasaRaiz frente a Airbnb y Booking
      </h1>
      <p className="mt-3 text-lg text-mar-950/70">
        En las plataformas tradicionales, la comisión se come una parte de cada reserva.
        En CasaRaiz, <strong className="text-mar-900">alquilas directo y sin comisiones</strong>.
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-mar-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-mar-100 text-left">
              <th className="p-3 text-mar-950/55">Concepto</th>
              <th className="p-3 text-otono-700">CasaRaiz</th>
              <th className="p-3 text-mar-950/55">Airbnb</th>
              <th className="p-3 text-mar-950/55">Booking</th>
            </tr>
          </thead>
          <tbody>
            {FILAS.map((f) => (
              <tr key={f.concepto} className="border-b border-mar-50 last:border-0">
                <td className="p-3 font-medium text-mar-900">{f.concepto}</td>
                <td className="p-3 font-semibold text-otono-700">{f.casa}</td>
                <td className="p-3 text-mar-950/65">{f.airbnb}</td>
                <td className="p-3 text-mar-950/65">{f.booking}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-mar-950/50">
        * Comisiones orientativas según tarifas públicas de cada plataforma (pueden variar). CasaRaiz no cobra comisión por reserva.
      </p>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-mar-950">Preguntas frecuentes</h2>
        <div className="mt-4 space-y-3">
          {FAQ.map((f) => (
            <div key={f.q} className="rounded-2xl border border-mar-100 bg-white p-4">
              <p className="font-semibold text-mar-900">{f.q}</p>
              <p className="mt-1 text-sm text-mar-950/70">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 rounded-3xl bg-mar-900 p-8 text-center text-white">
        <h2 className="text-2xl font-semibold">Prueba el alquiler sin comisiones</h2>
        <p className="mx-auto mt-2 max-w-xl text-white/70">
          Busca tu alquiler temporal o publica tu piso y olvídate de las comisiones.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/buscar" className="rounded-full bg-otono-600 px-6 py-3 font-medium hover:bg-otono-700">Buscar alquiler</Link>
          <Link href="/publicar" className="rounded-full border border-white/30 px-6 py-3 font-medium hover:bg-white/10">Publicar mi piso</Link>
        </div>
      </div>
    </main>
  );
}
