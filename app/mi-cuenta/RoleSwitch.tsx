"use client";

import { useState, useTransition } from "react";
import { switchMyRole } from "@/modules/users/actions";

export function RoleSwitch({ role }: { role: "owner" | "renter" }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function go(next: "owner" | "renter") {
    setMsg(null);
    start(async () => {
      try {
        await switchMyRole(next);
        setMsg(next === "owner" ? "Ahora eres dueño: puedes publicar en /duenos." : "Ahora eres inquilino: busca y contacta.");
      } catch {
        setMsg("No se pudo cambiar el rol.");
      }
    });
  }

  const pill = (active: boolean) =>
    `rounded-full px-5 py-2 text-sm font-medium ${active ? "bg-mar-900 text-white" : "border border-mar-200 bg-white text-mar-900 hover:bg-mar-50"}`;

  return (
    <div>
      <div className="flex gap-2">
        <button disabled={pending} onClick={() => go("renter")} className={pill(role === "renter")}>Busco piso</button>
        <button disabled={pending} onClick={() => go("owner")} className={pill(role === "owner")}>Soy dueño</button>
      </div>
      {msg && <p className="mt-2 text-sm text-mar-900">{msg}</p>}
      <p className="mt-2 text-xs text-mar-950/50">Puedes ser ambas cosas: cambia cuando quieras, no pierdes nada.</p>
    </div>
  );
}
