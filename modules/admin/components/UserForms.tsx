"use client";

import { useState, useTransition } from "react";
import { cancelSubscription, createCustomSubscription, grantComplimentary, updateUserData } from "../actions";

const input = "w-full rounded-lg border border-mar-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-mar-600";
const btnCoral = "rounded-full bg-coral-500 px-5 py-2 text-sm text-white hover:bg-coral-600 disabled:opacity-50";
const btnDark = "rounded-full bg-mar-900 px-5 py-2 text-sm text-white hover:bg-mar-800 disabled:opacity-50";

export function CancelSubButton({ stripeSubId }: { stripeSubId: string }) {
  const [pending, start] = useTransition();
  const [reason, setReason] = useState("");
  return (
    <span className="flex items-center gap-1">
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo..." className={`${input} !w-32 !py-0.5 !text-xs`} />
      <button
        disabled={pending}
        onClick={() => start(() => cancelSubscription(stripeSubId, reason || undefined))}
        className="rounded-full border border-coral-200 px-3 py-1 text-xs text-coral-700 hover:bg-coral-100 disabled:opacity-50"
      >
        Cancelar
      </button>
    </span>
  );
}

export function UserEditForm({ id, phone, role, dni }: { id: string; phone: string; role: "owner" | "renter"; dni: boolean }) {
  const [p, setP] = useState(phone);
  const [r, setR] = useState(role);
  const [d, setD] = useState(dni);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function save() {
    setMsg(null);
    start(async () => {
      try {
        await updateUserData(id, { phone: p, role: r, dniVerified: d }, reason);
        setMsg("Guardado con motivo registrado.");
        setReason("");
      } catch (e) {
        setMsg(`Error: ${e instanceof Error ? e.message : "desconocido"}`);
      }
    });
  }

  return (
    <div>
      <p className="text-sm font-medium text-mar-900">Editar datos (motivo obligatorio)</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <input value={p} onChange={(e) => setP(e.target.value)} placeholder="Teléfono" className={input} />
        <select value={r} onChange={(e) => setR(e.target.value as "owner" | "renter")} className={input}>
          <option value="renter">Inquilino</option>
          <option value="owner">Dueño</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-mar-900">
          <input type="checkbox" checked={d} onChange={(e) => setD(e.target.checked)} /> DNI verificado
        </label>
      </div>
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo del cambio (obligatorio, queda registrado)" className={`${input} mt-2`} />
      {msg && <p className="mt-1 text-xs text-mar-900">{msg}</p>}
      <button onClick={save} disabled={pending} className={`${btnDark} mt-2`}>Guardar cambios</button>
    </div>
  );
}

export function GrantForm({ userId }: { userId: string }) {
  const [plan, setPlan] = useState("renter_monthly");
  const [months, setMonths] = useState(3);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function go() {
    setMsg(null);
    start(async () => {
      try {
        await grantComplimentary(userId, plan as "renter_monthly" | "owner_monthly" | "owner_yearly", months, reason);
        setMsg("Cortesía activada.");
        setReason("");
      } catch (e) {
        setMsg(`Error: ${e instanceof Error ? e.message : "desconocido"}`);
      }
    });
  }

  return (
    <div className="rounded-xl bg-mar-50 p-3">
      <p className="text-sm font-medium text-mar-900">Cortesía (sin cobro)</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <select value={plan} onChange={(e) => setPlan(e.target.value)} className={input}>
          <option value="renter_monthly">Inquilino</option>
          <option value="owner_monthly">Dueño mensual</option>
          <option value="owner_yearly">Dueño anual</option>
        </select>
        <input type="number" min={1} max={24} value={months} onChange={(e) => setMonths(Number(e.target.value))} className={input} />
      </div>
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo (obligatorio)" className={`${input} mt-2`} />
      {msg && <p className="mt-1 text-xs text-mar-900">{msg}</p>}
      <button onClick={go} disabled={pending} className={`${btnDark} mt-2`}>Activar cortesía</button>
    </div>
  );
}

export function CustomPriceForm({ userId }: { userId: string }) {
  const [eur, setEur] = useState("15");
  const [int, setInt] = useState("month");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function go() {
    setMsg(null);
    start(async () => {
      try {
        const { invoiceUrl } = await createCustomSubscription(userId, Number(eur), int as "month" | "year", reason);
        setMsg(invoiceUrl ? `Creada. Factura para enviar al usuario: ${invoiceUrl}` : "Creada.");
        setReason("");
      } catch (e) {
        setMsg(`Error: ${e instanceof Error ? e.message : "desconocido"}`);
      }
    });
  }

  return (
    <div className="rounded-xl bg-coral-100/50 p-3">
      <p className="text-sm font-medium text-mar-900">Suscripción especial (precio propio, factura por email)</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <input type="number" min={1} value={eur} onChange={(e) => setEur(e.target.value)} className={input} />
        <select value={int} onChange={(e) => setInt(e.target.value)} className={input}>
          <option value="month">€/mes</option>
          <option value="year">€/año</option>
        </select>
      </div>
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo (obligatorio)" className={`${input} mt-2`} />
      {msg && <p className="mt-1 break-all text-xs text-mar-900">{msg}</p>}
      <button onClick={go} disabled={pending} className={`${btnCoral} mt-2`}>Crear especial</button>
    </div>
  );
}
