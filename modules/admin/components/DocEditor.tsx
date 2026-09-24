"use client";

import { useState, useTransition } from "react";
import { saveDoc } from "../actions";

export function DocEditor({ slug, title, content }: { slug: string; title: string; content: string }) {
  const [t, setT] = useState(title);
  const [c, setC] = useState(content);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function save() {
    setMsg(null);
    start(async () => {
      try {
        await saveDoc(slug, t, c);
        setMsg("Guardado y publicado.");
      } catch {
        setMsg("Error al guardar.");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-mar-100 bg-white p-5">
        <label className="block text-sm text-mar-900">Título
          <input
            className="mt-1 w-full rounded-lg border border-mar-200 px-3 py-2 text-sm outline-none focus:border-mar-600"
            value={t}
            onChange={(e) => setT(e.target.value)}
          />
        </label>
        <label className="mt-3 block text-sm text-mar-900">Contenido
          <textarea
            rows={22}
            className="mt-1 w-full rounded-lg border border-mar-200 px-3 py-2 font-mono text-sm outline-none focus:border-mar-600"
            value={c}
            onChange={(e) => setC(e.target.value)}
          />
        </label>
        {msg && <p className="mt-2 text-sm text-mar-900">{msg}</p>}
        <button
          onClick={save}
          disabled={pending}
          className="mt-3 rounded-full bg-otono-600 px-6 py-2 text-sm text-white hover:bg-otono-700 disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar y publicar"}
        </button>
      </div>
      <div className="rounded-2xl border border-mar-100 bg-white p-5">
        <p className="text-sm font-medium text-mar-900">Vista previa</p>
        <h2 className="mt-2 text-xl font-bold text-mar-950">{t}</h2>
        <p className="mt-3 whitespace-pre-line text-sm text-mar-950/80">{c}</p>
      </div>
    </div>
  );
}
