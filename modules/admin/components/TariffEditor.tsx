"use client";

import { useState, useTransition } from "react";
import { deleteTier, saveTariffSettings, saveTier, toggleTier } from "../actions";
import type { FeeTier } from "@/modules/billing/fees";

const input = "w-full rounded-lg border border-mar-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-mar-600";

export function TierEditor({ tier }: { tier: FeeTier | null }) {
  const [min, setMin] = useState(tier?.minProps ?? 1);
  const [max, setMax] = useState(tier?.maxProps === null || tier?.maxProps === undefined ? "" : String(tier.maxProps));
  const [eur, setEur] = useState(tier?.amountCents === null || tier?.amountCents === undefined ? "" : String(tier.amountCents / 100));
  const [label, setLabel] = useState(tier?.label ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function save() {
    setMsg(null);
    start(async () => {
      try {
        await saveTier({
          id: tier?.id,
          minProps: Number(min),
          maxProps: max === "" ? null : Number(max),
          amountEur: eur === "" ? null : Number(eur),
          label,
        });
        setMsg("Guardado.");
      } catch (e) {
        setMsg(`Error: ${e instanceof Error ? e.message : "desconocido"}`);
      }
    });
  }

  return (
    <div className={`rounded-2xl border bg-white p-5 ${tier ? "border-mar-100" : "border-dashed border-mar-300"}`}>
      <p className="text-sm font-medium text-mar-900">{tier ? tier.label : "+ Nuevo tramo"}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="text-xs text-mar-900">Desde<input type="number" min={1} className={`${input} mt-1`} value={min} onChange={(e) => setMin(Number(e.target.value))} /></label>
        <label className="text-xs text-mar-900">Hasta (vacío = ∞)<input type="number" min={1} className={`${input} mt-1`} value={max} placeholder="∞" onChange={(e) => setMax(e.target.value)} /></label>
      </div>
      <label className="mt-2 block text-xs text-mar-900">€/mes (vacío = a consultar)
        <input type="number" min={1} className={`${input} mt-1`} value={eur} placeholder="A consultar" onChange={(e) => setEur(e.target.value)} />
      </label>
      <label className="mt-2 block text-xs text-mar-900">Etiqueta
        <input className={`${input} mt-1`} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Hasta 3 pisos" />
      </label>
      {msg && <p className="mt-1 text-xs text-mar-900">{msg}</p>}
      <div className="mt-3 flex gap-2">
        <button onClick={save} disabled={pending} className="flex-1 rounded-full bg-mar-900 py-1.5 text-sm text-white hover:bg-mar-800 disabled:opacity-50">
          Guardar
        </button>
        {tier && (
          <>
            <button onClick={() => start(() => toggleTier(tier.id, !tier.active))} disabled={pending} className="rounded-full border border-mar-200 px-3 py-1.5 text-xs text-mar-900 hover:bg-mar-50 disabled:opacity-50">
              {tier.active ? "Off" : "On"}
            </button>
            <button onClick={() => { if (confirm("¿Eliminar tramo?")) start(() => deleteTier(tier.id)); }} disabled={pending} className="rounded-full border border-otono-200 px-3 py-1.5 text-xs text-otono-700 hover:bg-otono-100 disabled:opacity-50">
              ✕
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function SettingsEditor({ legend, contactLabel, contactUrl }: { legend: string; contactLabel: string; contactUrl: string }) {
  const [l, setL] = useState(legend);
  const [cl, setCl] = useState(contactLabel);
  const [cu, setCu] = useState(contactUrl);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function save() {
    setMsg(null);
    start(async () => {
      try {
        await saveTariffSettings({ legend: l, contactLabel: cl, contactUrl: cu });
        setMsg("Publicado en /precios.");
      } catch {
        setMsg("Error al guardar.");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      <label className="text-xs text-mar-900">Leyenda bajo las tarifas
        <textarea rows={2} className={`${input} mt-1`} value={l} onChange={(e) => setL(e.target.value)} />
      </label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="text-xs text-mar-900">Texto botón contacto
          <input className={`${input} mt-1`} value={cl} onChange={(e) => setCl(e.target.value)} />
        </label>
        <label className="text-xs text-mar-900">Destino (mailto: o https://wa.me/...)
          <input className={`${input} mt-1`} value={cu} onChange={(e) => setCu(e.target.value)} />
        </label>
      </div>
      {msg && <p className="text-xs text-mar-900">{msg}</p>}
      <button onClick={save} disabled={pending} className="w-fit rounded-full bg-otono-600 px-5 py-2 text-sm text-white hover:bg-otono-700 disabled:opacity-50">
        Guardar leyenda y contacto
      </button>
    </div>
  );
}
