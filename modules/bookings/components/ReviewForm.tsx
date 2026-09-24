"use client";

import { useState } from "react";
import { StarInput } from "./Stars";

const OWNER_CRITERIA = [
  { key: "servicio", label: "Servicio (1 malo · 5 excelente)" },
  { key: "comunicacion", label: "Comunicación con el propietario" },
  { key: "entorno", label: "Entorno" },
] as const;

export default function ReviewForm({ bookingId, kind, onDone }: { bookingId: string; kind: "to_owner" | "to_renter"; onDone?: () => void }) {
  const [vals, setVals] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setMsg(null);
    try {
      const body: Record<string, unknown> = { bookingId, comment: comment || undefined };
      if (kind === "to_owner") {
        body.servicio = vals.servicio;
        body.comunicacion = vals.comunicacion;
        body.entorno = vals.entorno;
      } else {
        body.actitud = vals.actitud;
      }
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(json.error === "YA_VALORADA" ? "Ya valoraste esta estancia." : json.error === "FUERA_DE_PLAZO" ? "Fuera de plazo de valoración." : "Revisa las notas (1-5).");
        return;
      }
      onDone?.();
    } finally {
      setSending(false);
    }
  }

  const criteria = kind === "to_owner" ? OWNER_CRITERIA : [{ key: "actitud", label: "Actitud del inquilino (1 mala · 5 excelente)" } as const];

  return (
    <form onSubmit={send} className="mt-2 space-y-2 rounded-xl bg-mar-50 p-3">
      {criteria.map((c) => (
        <div key={c.key} className="flex items-center justify-between gap-2 text-sm">
          <span className="text-mar-900">{c.label}</span>
          <StarInput value={vals[c.key] ?? 0} onChange={(n) => setVals((v) => ({ ...v, [c.key]: n }))} />
        </div>
      ))}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        maxLength={1000}
        placeholder="Comentario (opcional)"
        className="w-full rounded-lg border border-mar-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-mar-600"
      />
      {msg && <p className="text-xs text-otono-700">{msg}</p>}
      <button disabled={sending} className="rounded-full bg-otono-600 px-5 py-1.5 text-sm text-white hover:bg-otono-700 disabled:opacity-50">
        {sending ? "Enviando..." : "Publicar valoración"}
      </button>
    </form>
  );
}
