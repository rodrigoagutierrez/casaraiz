import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contrato firmado digitalmente · CasaRaiz",
  description: "Firma el contrato de temporada (LAU) online con validez legal, sin papeles ni desplazamientos.",
  alternates: { canonical: "/confianza/contrato-digital" },
};

export default function ContratoDigitalPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-mar-950">Contrato firmado digitalmente</h1>
      <p className="mt-2 text-mar-950/65">
        Cada reserva en CasaRaiz se formaliza con un contrato de alquiler de temporada regulado por el art. 3 de la LAU. El contrato se firma digitalmente, con validez legal plena, sin papeles ni desplazamientos.
      </p>

      <section className="mt-10 rounded-2xl border border-mar-100 bg-white p-6">
        <h2 className="text-xl font-semibold text-mar-900 mb-4">¿Cómo se firma el contrato?</h2>
        <ol className="space-y-4 text-sm text-mar-950/70 list-disc list-inside">
          <li>Una vez el dueño acepta tu contacto, se genera el contrato de temporada con los datos del piso, fechas, precio y fianza.</li>
          <li>Ambas partes (inquilino y dueño) lo firman digitalmente desde su cuenta de CasaRaiz.</li>
          <li>El contrato firmado queda guardado y disponible para descargar en todo momento.</li>
          <li>Tiene validez legal frente a terceros y administraciones.</li>
        </ol>
      </section>

      <section className="mt-10 rounded-2xl border border-mar-100 bg-white p-6">
        <h2 className="text-xl font-semibold text-mar-900 mb-4">¿Qué incluye el contrato?</h2>
        <ul className="space-y-3 text-sm text-mar-950/70">
          <li>Datos del arrendador y del arrendatario.</li>
          <li>Dirección y descripción del piso, número de registro (NRA).</li>
          <li>Fechas de entrada y salida, precio por noche y fianza (2 meses).</li>
          <li>Obligaciones de cada parte y causa temporal de la estancia.</li>
        </ul>
      </section>

      <div className="mt-12 flex gap-3">
        <a href="/confianza/sin-comisiones" className="rounded-full border border-mar-200 bg-white px-6 py-2.5 text-sm font-medium text-mar-900 hover:bg-mar-50">
          Sin comisiones ni tasas ocultas
        </a>
        <a href="/buscar" className="rounded-full bg-otono-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-otono-700">
          Buscar piso
        </a>
      </div>
    </main>
  );
}
