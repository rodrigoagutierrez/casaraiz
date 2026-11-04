"use client";

import { useState, useTransition } from "react";
import { createManualSubscription } from "../actions";

const input = "w-full rounded-lg border border-mar-200 bg-white px-3 py-2 text-sm outline-none focus:border-mar-600";

export function AddSubscriptionForm() {
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<"owner_monthly" | "owner_yearly">("owner_monthly");
  const [seasonal, setSeasonal] = useState(false);
  const [validUntil, setValidUntil] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      try {
        await createManualSubscription({
          email,
          plan,
          kind: seasonal ? "seasonal" : "standard",
          validUntil: seasonal ? validUntil : undefined,
          note: note || undefined,
        });
        setMsg({ ok: true, text: "Suscripción creada." });
        setEmail("");
        setNote("");
        setValidUntil("");
        setSeasonal(false);
      } catch (err) {
        setMsg({ ok: false, text: err instanceof Error ? err.message : "Error al crear." });
      }
    });
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-otono-200 bg-otono-100/40 p-5">
      <p className="font-semibold text-mar-900">Añadir suscripción</p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-xs text-mar-900">Email del usuario
          <input className={`${input} mt-1`} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="dueno@casaraizalquiler.com" />
        </label>
        <label className="text-xs text-mar-900">Plan
          <select className={`${input} mt-1`} value={plan} onChange={(e) => setPlan(e.target.value as "owner_monthly" | "owner_yearly")}>
            <option value="owner_monthly">Dueño mensual</option>
            <option value="owner_yearly">Dueño anual</option>
          </select>
        </label>
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm text-mar-900">
        <input type="checkbox" checked={seasonal} onChange={(e) => setSeasonal(e.target.checked)} />
        Oferta de temporada (validez limitada)
      </label>

      {seasonal && (
        <label className="mt-2 block text-xs text-mar-900">Válida hasta
          <input className={`${input} mt-1`} type="date" required value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
        </label>
      )}

      <label className="mt-3 block text-xs text-mar-900">Nota (opcional)
        <input className={`${input} mt-1`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej. verano 2026, cliente especial..." />
      </label>

      {msg && <p className={`mt-2 text-xs ${msg.ok ? "text-green-700" : "text-otono-700"}`}>{msg.text}</p>}

      <button disabled={pending} className="mt-3 rounded-full bg-otono-600 px-6 py-2 text-sm text-white hover:bg-otono-700 disabled:opacity-50">
        {pending ? "Creando..." : "Añadir suscripción"}
      </button>
    </form>
  );
}
