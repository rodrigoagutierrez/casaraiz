"use client";

import { useState, useTransition } from "react";
import { savePlan } from "../actions";

export function PlanEditor({
  plan,
  name,
  amountCents,
  interval,
  stripePriceId,
  maxListings,
}: {
  plan: string;
  name: string;
  amountCents: number;
  interval: string;
  stripePriceId: string | null;
  maxListings: number | null;
}) {
  const [n, setN] = useState(name);
  const [eur, setEur] = useState((amountCents / 100).toString());
  const [int, setInt] = useState(interval);
  const [max, setMax] = useState(maxListings === null ? "" : String(maxListings));
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const input = "w-full rounded-lg border border-mar-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-mar-600";

  function save() {
    setMsg(null);
    start(async () => {
      try {
        const id = await savePlan(plan, { name: n, amountEur: Number(eur), interval: int as "month" | "year", maxListings: max === "" ? null : Number(max) });
        setMsg(`Guardado. Price activo: ${id}`);
      } catch (e) {
        setMsg(`Error: ${e instanceof Error ? e.message : "desconocido"}`);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-mar-100 bg-white p-5">
      <p className="text-xs text-mar-950/50">{plan}</p>
      <label className="mt-2 block text-sm text-mar-900">Nombre
        <input className={`${input} mt-1`} value={n} onChange={(e) => setN(e.target.value)} />
      </label>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="text-sm text-mar-900">Precio €
          <input type="number" min={1} step={1} className={`${input} mt-1`} value={eur} onChange={(e) => setEur(e.target.value)} />
        </label>
        <label className="text-sm text-mar-900">Periodo
          <select className={`${input} mt-1`} value={int} onChange={(e) => setInt(e.target.value)}>
            <option value="month">Mes</option>
            <option value="year">Año</option>
          </select>
        </label>
      </div>
      <label className="mt-2 block text-sm text-mar-900">Máx. pisos (vacío = ilimitado, 0 = no publica)
        <input type="number" min={0} className={`${input} mt-1`} value={max} placeholder="Ilimitado" onChange={(e) => setMax(e.target.value)} />
      </label>
      <p className="mt-2 truncate text-xs text-mar-950/50">Stripe: {stripePriceId ?? "—"}</p>
      {msg && <p className="mt-2 text-xs text-mar-900">{msg}</p>}
      <button
        onClick={save}
        disabled={pending}
        className="mt-3 w-full rounded-full bg-mar-900 py-2 text-sm text-white hover:bg-mar-800 disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar"}
      </button>
    </div>
  );
}
