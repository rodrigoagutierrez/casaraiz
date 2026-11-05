"use client";

import { useState } from "react";

/** Formato de miles con punto, independiente del ICU del runtime (evita hydration mismatch). */
function fmt(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Comisiones de referencia (consultadas el 5 nov 2026, fuentes oficiales en el pie).
const PCT_BOOKING = 0.15; // Booking.com: comisión estándar 15% (rango por contrato 10–25%)
const PCT_AIRBNB = 0.155; // Airbnb: tarifa única del anfitrión ~15,5% (14–16%); el 3% es el modelo antiguo en desuso
const IVA_AGENCIA = 0.21; // Inmobiliaria: 1 mes de renta + 21% IVA por contrato

type Resultado = {
  id: string;
  titulo: string;
  detalle: string;
  fuente: string;
  coste: number;
};

export default function SavingsSimulator() {
  const [precio, setPrecio] = useState(800);
  const [pisos, setPisos] = useState(1);

  const anual = precio * 12 * pisos;
  // Membresía CasaRaiz en anual (2 meses gratis): 190 €/año hasta 2 pisos, 290 €/año de 3 a 5.
  const membresia = pisos <= 2 ? 190 : 290;

  const resultados: Resultado[] = [
    {
      id: "inmobiliaria",
      titulo: "Frente a una inmobiliaria",
      detalle: `Comisión de agencia: 1 mes de renta + 21% IVA por contrato`,
      fuente: "Consumo (DSCA) y práctica de mercado en España",
      coste: precio * (1 + IVA_AGENCIA) * pisos,
    },
    {
      id: "booking",
      titulo: "Frente a Booking.com",
      detalle: `Comisión estándar del 15% (10–25% según contrato)`,
      fuente: "Booking.com Partner Hub, «Understanding your commission»",
      coste: anual * PCT_BOOKING,
    },
    {
      id: "airbnb",
      titulo: "Frente a Airbnb",
      detalle: `Tarifa única del anfitrión ~15,5% (14–16%)`,
      fuente: "Centro de Ayuda Airbnb, «Airbnb service fees»",
      coste: anual * PCT_AIRBNB,
    },
  ];

  const destacado = resultados[0];
  const ahorroDestacado = destacado.coste - membresia;

  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-20">
      <div className="rounded-2xl border border-mar-100 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-mar-900 mb-2">
              Cuánto te ahorras al año
            </h2>
            <p className="text-sm text-mar-950/60 mb-6">
              Compara tu membresía con lo que cobra cada opción. Sin trampas: el ahorro sale por plataforma.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-mar-900 mb-1">Precio de alquiler mensual (€)</label>
                <input
                  id="precioAlquiler"
                  type="number"
                  min="0"
                  step="50"
                  value={precio}
                  onChange={(e) => setPrecio(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-mar-200 bg-white px-3 py-1.5 text-sm text-mar-950 outline-none focus:border-mar-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-mar-900 mb-1">Número de pisos publicados</label>
                <select
                  id="numPisos"
                  value={pisos}
                  onChange={(e) => setPisos(Number(e.target.value) || 1)}
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

            <div className="mt-6 rounded-xl border border-otono-200 bg-otono-50 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-otono-700">
                Tu ventaja principal
              </p>
              <p className="mt-1 text-sm text-mar-950/70">
                {destacado.titulo} (1 mes de renta + IVA por contrato)
              </p>
              <p className="text-3xl font-bold text-otono-600">
                {ahorroDestacado > 0 ? fmt(ahorroDestacado) : "0"} €/año
              </p>
              <p className="mt-1 text-xs text-mar-950/60">
                Frente a {fmt(destacado.coste)} € de comisión de agencia, con una membresía de {fmt(membresia)} €/año.
              </p>
            </div>
          </div>

          {/* Ahorro por plataforma, por separado */}
          <div className="flex-1 w-full space-y-3">
            {resultados.map((r) => {
              const ahorro = r.coste - membresia;
              return (
                <div key={r.id} className="rounded-xl border border-mar-100 bg-mar-50 p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-semibold text-mar-900">{r.titulo}</p>
                    <p className="text-sm font-medium text-mar-950/60">
                      {fmt(r.coste)} €/año
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-mar-950/60">{r.detalle}</p>
                  <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-mar-100 pt-2">
                    <p className="text-xs text-mar-950/55">Ahorro con CasaRaiz</p>
                    <p className="text-lg font-bold text-otono-600">
                      {ahorro > 0 ? fmt(ahorro) : "0"} €/año
                    </p>
                  </div>
                  <p className="mt-1 text-[11px] text-mar-950/45">Fuente: {r.fuente} · 5 nov 2026</p>
                </div>
              );
            })}
            <div className="rounded-xl border border-mar-100 bg-white p-4">
              <p className="text-xs font-medium text-mar-900">Y para el inquilino</p>
              <p className="mt-1 text-xs text-mar-950/60">
                Cero tasas de servicio: en Airbnb el huésped paga además un 14–16% de tarjeta de servicio (en Booking
                esa tasa la paga el dueño, no el inquilino). En CasaRaiz el inquilino no paga nada.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-mar-100 bg-mar-50 p-6">
          <h4 className="text-sm font-semibold text-mar-900 mb-3">Cómo se calcula</h4>
          <div className="grid grid-cols-1 gap-3 text-sm text-mar-950/70 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 text-otono-600">1.</span>
              <div>
                <p className="font-medium text-mar-900">Ingreso anual</p>
                <p className="text-xs text-mar-950/60">
                  {fmt(precio)} €/mes × 12 meses × {pisos} piso{pisos > 1 ? "s" : ""} ={" "}
                  <span className="font-bold">{fmt(anual)} €/año</span>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 text-otono-600">2.</span>
              <div>
                <p className="font-medium text-mar-900">Tu membresía CasaRaiz (anual)</p>
                <p className="text-xs text-mar-950/60">
                  {pisos <= 2 ? "190 €/año (hasta 2 pisos)" : "290 €/año (de 3 a 5 pisos)"} = 2 meses gratis frente
                  al mensual · <span className="font-bold">{fmt(membresia)} €/año</span>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 text-otono-600">3.</span>
              <div>
                <p className="font-medium text-mar-900">Comisiones de referencia</p>
                <p className="text-xs text-mar-950/60">
                  Inmobiliaria {fmt(precio * (1 + IVA_AGENCIA) * pisos)} € · Booking {fmt(anual * PCT_BOOKING)} € ·
                  Airbnb {fmt(anual * PCT_AIRBNB)} €
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 text-otono-600">4.</span>
              <div>
                <p className="font-medium text-mar-900">Tu ahorro, por separado</p>
                <p className="text-xs text-mar-950/60">
                  Comisión de cada plataforma − {fmt(membresia)} € de membresía (una sola cifra, sin sumar plataformas)
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-mar-950/50">
          <strong className="font-medium">Fuentes (consultadas el 5 de noviembre de 2026):</strong> Airbnb, Centro de
          Ayuda «Airbnb service fees» (tarifa única del anfitrión ~15,5%, rango 14–16%; el modelo de reparto al 3% se
          está eliminando) · Booking.com Partner Hub «Understanding your commission» y guías de comisiones 2026 (15%
          estándar, 10–25% según contrato; programas Preferred +3%) · Inmobiliarias:1 mes de renta + 21% IVA por
          contrato (Consumo/DSCA y práctica de mercado). Porcentajes orientativos: cada plataforma puede variarlos por
          contrato. CasaRaiz no cobra comisión por alquiler; solo la membresía del dueño.
        </p>
      </div>
    </section>
  );
}
