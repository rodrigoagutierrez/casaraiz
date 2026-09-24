"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function DecisionButtons({ id, role }: { id: string; role: "owner" | "renter" }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function decide(decision: string) {
    start(async () => {
      await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      router.refresh();
    });
  }

  const btn = "rounded-full px-4 py-1.5 text-xs disabled:opacity-50";
  return (
    <span className="flex gap-1">
      {role === "owner" ? (
        <>
          <button disabled={pending} onClick={() => decide("confirmed")} className={`${btn} bg-green-700 text-white hover:bg-green-800`}>
            Confirmar
          </button>
          <button disabled={pending} onClick={() => decide("declined")} className={`${btn} border border-mar-200 text-mar-900 hover:bg-mar-50`}>
            Rechazar
          </button>
        </>
      ) : (
        <button disabled={pending} onClick={() => decide("canceled")} className={`${btn} border border-mar-200 text-mar-900 hover:bg-mar-50`}>
          Cancelar solicitud
        </button>
      )}
    </span>
  );
}
