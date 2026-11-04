"use client";

import { useState, useTransition } from "react";
import { updateThingsToKnow } from "@/modules/users/actions";
import type { ThingToKnow } from "@/modules/users/thingsToKnow";

const input = "w-full rounded-lg border border-mar-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-mar-600";

export default function ThingsToKnowEditor({ initial }: { initial: ThingToKnow[] }) {
  const [items, setItems] = useState<ThingToKnow[]>(initial.length ? initial : []);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function update(i: number, field: "t" | "d", value: string) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  }
  function add() {
    setItems((prev) => [...prev, { t: "", d: "" }]);
  }
  function remove(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function save() {
    setMsg(null);
    start(async () => {
      try {
        await updateThingsToKnow(items);
        setMsg("Guardado.");
      } catch (e) {
        setMsg(`Error: ${e instanceof Error ? e.message : "desconocido"}`);
      }
    });
  }

  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border border-mar-100 bg-mar-50 p-3">
          <div className="flex items-start gap-2">
            <input className={`${input} flex-1`} value={it.t} placeholder="Título (ej. Sin comisiones)" onChange={(e) => update(i, "t", e.target.value)} />
            <button type="button" onClick={() => remove(i)} className="rounded-full border border-otono-200 px-2.5 py-1.5 text-xs text-otono-700 hover:bg-otono-100" aria-label="Eliminar">
              ✕
            </button>
          </div>
          <textarea className={`${input} mt-2 w-full`} rows={2} value={it.d} placeholder="Descripción" onChange={(e) => update(i, "d", e.target.value)} />
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={add} className="rounded-full border border-mar-200 bg-white px-4 py-1.5 text-sm text-mar-900 hover:bg-mar-50">
          + Añadir punto
        </button>
        <button type="button" onClick={save} disabled={pending} className="rounded-full bg-mar-900 px-5 py-1.5 text-sm text-white hover:bg-mar-800 disabled:opacity-50">
          {pending ? "Guardando..." : "Guardar"}
        </button>
      </div>
      {msg && <p className="text-xs text-mar-900">{msg}</p>}
      <p className="text-xs text-mar-950/55">Se muestra en la ficha de tus pisos. Si lo dejas vacío, se usan los valores por defecto.</p>
    </div>
  );
}
