"use client";

import { useState, useTransition } from "react";
import { saveGuaranteeSettings } from "../actions";

const input = "w-full rounded-lg border border-mar-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-mar-600";

export function GuaranteeSettingsForm({ initial }: { initial: Record<string, string> }) {
  const [form, setForm] = useState({
    garantia_activa: initial.garantia_activa ?? "true",
    garantia_nombre: initial.garantia_nombre ?? "Garantía CasaRaiz",
    garantia_pct: initial.garantia_pct ?? "5",
    garantia_min_cents: String(Math.round(Number(initial.garantia_min_cents ?? 900) / 100)),
    garantia_max_cents: initial.garantia_max_cents ? String(Math.round(Number(initial.garantia_max_cents) / 100)) : "",
    garantia_texto: initial.garantia_texto ?? "",
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function save() {
    setMsg(null);
    start(async () => {
      try {
        await saveGuaranteeSettings({
          garantia_activa: form.garantia_activa,
          garantia_nombre: form.garantia_nombre,
          garantia_pct: form.garantia_pct,
          garantia_min_cents: String(Math.round(Number(form.garantia_min_cents || 0) * 100)),
          garantia_max_cents: form.garantia_max_cents === "" ? "" : String(Math.round(Number(form.garantia_max_cents) * 100)),
          garantia_texto: form.garantia_texto,
        });
        setMsg("Guardado. Se aplica a las próximas reservas.");
      } catch {
        setMsg("Error al guardar.");
      }
    });
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="text-sm text-mar-900">Estado
        <select className={`${input} mt-1`} value={form.garantia_activa} onChange={set("garantia_activa")}>
          <option value="true">Activa</option>
          <option value="false">Desactivada</option>
        </select>
      </label>
      <label className="text-sm text-mar-900">Nombre
        <input className={`${input} mt-1`} value={form.garantia_nombre} onChange={set("garantia_nombre")} />
      </label>
      <label className="text-sm text-mar-900">% sobre el total
        <input type="number" min={1} max={30} className={`${input} mt-1`} value={form.garantia_pct} onChange={set("garantia_pct")} />
      </label>
      <label className="text-sm text-mar-900">Mínimo €
        <input type="number" min={0} className={`${input} mt-1`} value={form.garantia_min_cents} onChange={set("garantia_min_cents")} />
      </label>
      <label className="text-sm text-mar-900">Tope € (vacío = sin tope)
        <input type="number" min={0} className={`${input} mt-1`} value={form.garantia_max_cents} onChange={set("garantia_max_cents")} placeholder="Sin tope" />
      </label>
      <label className="text-sm text-mar-900 sm:col-span-2">Texto de cobertura (lo ve el inquilino)
        <textarea rows={2} className={`${input} mt-1`} value={form.garantia_texto} onChange={set("garantia_texto")} />
      </label>
      {msg && <p className="text-sm text-mar-900 sm:col-span-2">{msg}</p>}
      <div className="sm:col-span-2">
        <button onClick={save} disabled={pending} className="rounded-full bg-mar-900 px-6 py-2 text-sm text-white hover:bg-mar-800 disabled:opacity-50">
          {pending ? "Guardando..." : "Guardar configuración"}
        </button>
      </div>
    </div>
  );
}
