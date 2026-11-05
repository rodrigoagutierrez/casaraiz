"use client";

import { useState, useTransition } from "react";
import { updateMyPhone } from "@/modules/users/actions";

export default function PhoneForm({ initial, isOwner }: { initial: string; isOwner: boolean }) {
  const [phone, setPhone] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();

  function save() {
    setMsg(null);
    setOk(false);
    start(async () => {
      try {
        await updateMyPhone(phone);
        setOk(true);
        setMsg(phone.trim() ? "Teléfono guardado." : "Teléfono eliminado.");
      } catch (e) {
        setMsg(e instanceof Error && e.message === "TELEFONO_INVALIDO"
          ? "Formato no válido. Ejemplos: 612345678, +34 612 345 678."
          : "No se pudo guardar. Prueba de nuevo.");
      }
    });
  }

  return (
    <div className="mt-3 space-y-2">
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="612 345 678"
        className="w-full rounded-lg border border-mar-200 bg-white px-3 py-2 text-sm outline-none focus:border-mar-600"
      />
      {msg && <p className={`text-xs ${ok ? "text-green-700" : "text-otono-700"}`}>{msg}</p>}
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={pending}
          className="rounded-full bg-mar-900 px-5 py-1.5 text-sm text-white hover:bg-mar-800 disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar teléfono"}
        </button>
        {isOwner && !phone.trim() && (
          <p className="text-xs text-otono-700">Obligatorio para publicar o activar pisos.</p>
        )}
      </div>
    </div>
  );
}
