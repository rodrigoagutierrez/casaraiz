import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sin comisiones ni tasas ocultas · CasaRaiz",
  description: "El precio que ves es el precio que pagas. CasaRaiz no cobra comisión por alquiler, solo la membresía del dueño.",
  alternates: { canonical: "/confianza/sin-comisiones" },
};

export default function SinComisionesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-mar-950">Sin comisiones ni tasas ocultas</h1>
      <p className="mt-2 text-mar-950/65">
        En CasaRaiz no hay comisión por alquiler ni cargos sorpresa. El inquilino usa la plataforma gratis y el dueño paga solo su membresía (mensual o anual). El precio del piso es el que acuerdas directamente con el dueño.
      </p>

      <section className="mt-10 rounded-2xl border border-mar-100 bg-white p-6">
        <h2 className="text-xl font-semibold text-mar-900 mb-4">¿Qué no pagas en CasaRaiz?</h2>
        <ul className="space-y-3 text-sm text-mar-950/70 list-disc list-inside">
          <li>Comisión de intermediación por el alquiler (cero %).</li>
          <li>Tasas de gestión o de reserva.</li>
          <li>Costes de firma del contrato.</li>
          <li>Sobrecostes ocultos en el precio por noche.</li>
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border border-mar-100 bg-white p-6">
        <h2 className="text-xl font-semibold text-mar-900 mb-4">¿Cómo se financia CasaRaiz?</h2>
        <ul className="space-y-3 text-sm text-mar-950/70">
          <li>El dueño paga una membresía por tramos: 19 €/mes hasta 2 pisos o 29 €/mes de 3 a 5 (o el anual equivalente, con 2 meses gratis).</li>
          <li>Los inquilinos no pagan nada por buscar, contactar o reservar.</li>
          <li>La fianza de 2 meses la acuerdas directamente con el dueño, según la ley.</li>
        </ul>
      </section>

      <div className="mt-12 flex gap-3">
        <a href="/precios" className="rounded-full bg-otono-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-otono-700">
          Ver planes de dueño
        </a>
        <a href="/buscar" className="rounded-full border border-mar-200 bg-white px-6 py-2.5 text-sm font-medium text-mar-900 hover:bg-mar-50">
          Buscar piso
        </a>
      </div>
    </main>
  );
}
