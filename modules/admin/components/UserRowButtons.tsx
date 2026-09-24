"use client";

import { useTransition } from "react";
import { setDniVerified, setUserRole } from "../actions";

export function UserRowButtons({ id, role, dni }: { id: string; role: "owner" | "renter"; dni: boolean }) {
  const [pending, start] = useTransition();
  const btn = "rounded-full border border-mar-200 px-3 py-1 text-xs text-mar-900 hover:bg-mar-50 disabled:opacity-50";
  return (
    <div className="flex gap-1">
      <button
        className={btn}
        disabled={pending}
        onClick={() => start(() => setUserRole(id, role === "owner" ? "renter" : "owner"))}
      >
        → {role === "owner" ? "Inquilino" : "Dueño"}
      </button>
      <button
        className={btn}
        disabled={pending}
        onClick={() => start(() => setDniVerified(id, !dni))}
      >
        DNI {dni ? "off" : "on"}
      </button>
    </div>
  );
}
