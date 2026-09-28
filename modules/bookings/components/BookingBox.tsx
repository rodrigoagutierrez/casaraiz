"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignInButton, useUser } from "@clerk/nextjs";

const ERRORS: Record<string, string> = {
  NO_DISPONIBLE: "Esas fechas ya están reservadas. Prueba otras.",
  EXCEDE_CAPACIDAD: "Excede la capacidad del piso.",
  FUERA_DE_TEMPORADA: "Fuera de la temporada del anuncio.",
  FECHAS_INVALIDAS: "Revisa las fechas.",
  ES_TU_PISO: "Es tu propio piso.",
};

type GarCfg = { nombre: string; pct: number; minCents: number; maxCents: number | null; texto: string };

function eur(c: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(c / 100);
}

// Solicitud de reserva temporal (el dueño la confirma)
export default function BookingBox({ propertyId, maxHuespedes, priceCents }: { propertyId: string; maxHuespedes: number; priceCents: number }) {
  const { isSignedIn } = useUser();
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState(2);
  const [garantia, setGarantia] = useState(false);
  const [cfg, setCfg] = useState<GarCfg | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/garantia/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.activa) setCfg(j);
      })
      .catch(() => {});
  }, []);

  const nights =
    checkin && checkout && checkout > checkin
      ? Math.max(1, Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000))
      : 0;
  const quote = cfg && nights > 0 ? Math.min(Math.max(Math.round(((nights * priceCents * cfg.pct) / 100)), cfg.minCents), cfg.maxCents ?? Infinity) : null;

  if (!isSignedIn) {
    return (
      <div>
        <p className="mt-1 text-mar-950/55">Entra para solicitar tu estancia.</p>
        <SignInButton mode="modal">
          <button className="mt-3 rounded-full bg-otono-600 px-5 py-2 text-white hover:bg-otono-700">
            Entrar para reservar
          </button>
        </SignInButton>
      </div>
    );
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setMsg("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, checkin, checkout, guests, garantia }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(ERRORS[json.error as string] ?? "No se pudo enviar la solicitud.");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setMsg("Error de red.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="mt-3 rounded-xl bg-mar-50 p-4 text-sm text-mar-900">
        ✓ Solicitud enviada. El dueño la confirmará y la verás en{" "}
        <Link href="/reservas" className="font-medium underline">Mis reservas</Link>.
      </p>
    );
  }

  const input = "w-full rounded-lg border border-mar-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-mar-600";

  return (
    <form onSubmit={send} className="mt-3 grid grid-cols-2 gap-2">
      <label className="text-xs text-mar-900">Check-in
        <input type="date" required value={checkin} onChange={(e) => setCheckin(e.target.value)} className={`${input} mt-1`} />
      </label>
      <label className="text-xs text-mar-900">Check-out
        <input type="date" required min={checkin || undefined} value={checkout} onChange={(e) => setCheckout(e.target.value)} className={`${input} mt-1`} />
      </label>
      <label className="col-span-2 text-xs text-mar-900">Huéspedes (máx. {maxHuespedes})
        <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className={`${input} mt-1`}>
          {Array.from({ length: Math.min(maxHuespedes, 16) }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>
      {msg && <p className="col-span-2 text-xs text-otono-700">{msg}</p>}
      {cfg && (
        <label className="col-span-2 flex cursor-pointer items-start gap-2 rounded-xl border border-mar-100 bg-mar-50 p-3">
          <input type="checkbox" checked={garantia} onChange={(e) => setGarantia(e.target.checked)} className="mt-0.5" />
          <span className="text-xs text-mar-900">
            <strong>{cfg.nombre}{quote !== null ? ` (+${eur(quote)})` : ""}</strong>
            <br />
            <span className="text-mar-950/60">{cfg.texto}</span>
          </span>
        </label>
      )}
      <button disabled={state === "sending"} className="col-span-2 rounded-full bg-mar-900 py-2 text-sm text-white hover:bg-mar-800 disabled:opacity-50">
        {state === "sending" ? "Enviando..." : "Solicitar reserva"}
      </button>
    </form>
  );
}
