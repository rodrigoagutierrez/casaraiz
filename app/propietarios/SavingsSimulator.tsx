"use client";

import { useState } from "react";

export default function SavingsSimulator() {
  const [precio, setPrecio] = useState(800);
  const [pisos, setPisos] = useState(1);

  const anual = precio * 12 * pisos;
  const casa = pisos <= 3 ? 19 * 12 : pisos <= 5 ? 29 * 12 : 149;
  const airbnb = anual * 0.03;
  const booking = anual * 0.15;
  const ahorro = Math.max(airbnb - casa, booking - casa);

  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-20">
      <div className="rounded-2xl border border-mar-100 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-mar-900 mb-2">Simulador de ahorro vs Airbnb y Booking</h2>
            <p className="text-sm text-mar-950/60 mb-6">Cuánto te ahorras con CasaRaiz al año</p>
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
          </div>
          <div className="flex-1 bg-mar-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-mar-900 mb-4">Con CasaRaiz</h3>
            <p className="text-2xl font-bold text-mar-900">{casa.toLocaleString("es-ES")} €/año</p>
            <h3 className="mt-4 text-lg font-semibold text-mar-900 mb-4">Con Airbnb (~3%)</h3>
            <p className="text-2xl font-bold text-otono-700">{Math.round(airbnb).toLocaleString("es-ES")} €/año</p>
            <h3 className="mt-4 text-lg font-semibold text-mar-900 mb-4">Con Booking (~15%)</h3>
            <p className="text-2xl font-bold text-otono-700">{Math.round(booking).toLocaleString("es-ES")} €/año</p>
            <div className="mt-6 pt-4 border-t border-mar-100">
              <h4 className="text-sm font-semibold text-mar-900">Te ahorras al año</h4>
              <p className="text-3xl font-bold text-otono-600">{ahorro > 0 ? Math.round(ahorro).toLocaleString("es-ES") : 0} €/año</p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-mar-100 bg-mar-50 p-6">
          <h4 className="text-sm font-semibold text-mar-900 mb-3">Cómo se calcula</h4>
          <div className="grid grid-cols-1 gap-3 text-sm text-mar-950/70">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 text-otono-600">1.</span>
              <div>
                <p className="font-medium text-mar-900">Ingreso anual</p>
                <p className="text-xs text-mar-950/60">{precio.toLocaleString("es-ES")} €/mes × 12 meses × {pisos} piso{pisos > 1 ? "s" : ""} = <span className="font-bold">{anual.toLocaleString("es-ES")} €/año</span></p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 text-otono-600">2.</span>
              <div>
                <p className="font-medium text-mar-900">Comisión Airbnb (~3%)</p>
                <p className="text-xs text-mar-950/60">{anual.toLocaleString("es-ES")} € × 3% = <span className="font-bold text-otono-700">{Math.round(airbnb).toLocaleString("es-ES")} €/año</span></p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 text-otono-600">3.</span>
              <div>
                <p className="font-medium text-mar-900">Comisión Booking (~15%)</p>
                <p className="text-xs text-mar-950/60">{anual.toLocaleString("es-ES")} € × 15% = <span className="font-bold text-otono-700">{Math.round(booking).toLocaleString("es-ES")} €/año</span></p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 text-otono-600">4.</span>
              <div>
                <p className="font-medium text-mar-900">Membresía CasaRaiz</p>
                <p className="text-xs text-mar-950/60">{pisos <= 3 ? "19 €/mes × 12 = 228 €/año" : pisos <= 5 ? "29 €/mes × 12 = 348 €/año" : "149 €/año"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-mar-100 pt-3 mt-3">
              <span className="flex-shrink-0 text-otono-600">5.</span>
              <div>
                <p className="font-medium text-mar-900">Tu ahorro real</p>
                <p className="text-xs text-mar-950/60">Comisión de plataforma − Membresía CasaRaiz = <span className="font-bold text-otono-600">{ahorro > 0 ? Math.round(ahorro).toLocaleString("es-ES") : 0} €/año</span></p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-mar-950/50 text-center">Cálculo estimado: comisión Airbnb ~3% sobre el alquiler, Booking ~15%. CasaRaiz: solo membresía (19 €/mes hasta 3 pisos, 29 €/mes de 3 a 5, 149 €/año hasta 15).</p>
      </div>
    </section>
  );
}
