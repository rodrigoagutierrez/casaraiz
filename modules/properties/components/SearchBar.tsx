"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CIUDADES_ES } from "@/modules/properties/geocode";

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#bc5f1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function CalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#bc5f1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#bc5f1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 7" />
    </svg>
  );
}

export default function SearchBar() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [huespedes, setHuespedes] = useState("");

  function go(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (city) q.set("city", city);
    if (desde) q.set("desde", desde);
    if (hasta) q.set("hasta", hasta);
    if (huespedes) q.set("huespedes", huespedes);
    router.push(`/buscar?${q.toString()}`);
  }

  return (
    <form
      onSubmit={go}
      className="mx-auto flex max-w-3xl flex-col gap-1 rounded-3xl bg-white p-2 text-left shadow-2xl sm:flex-row sm:items-stretch sm:rounded-full"
    >
      <label className="flex flex-1 items-center gap-3 px-5 py-2">
        <PinIcon />
        <span className="flex-1">
          <span className="block text-sm font-semibold text-mar-950">Lugar</span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            list="ciudades-hero"
            placeholder="Busca tu alquiler"
            className="w-full bg-transparent text-sm text-mar-950/60 outline-none placeholder:text-mar-950/60"
          />
          <datalist id="ciudades-hero">
            {CIUDADES_ES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </span>
      </label>
      <label className="flex flex-1 items-center gap-3 border-t border-mar-100 px-5 py-2 sm:border-l sm:border-t-0">
        <CalIcon />
        <span className="flex-1">
          <span className="block text-sm font-semibold text-mar-950">Check-in / Check-out</span>
          <span className="flex items-center gap-1">
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full bg-transparent text-sm text-mar-950/60 outline-none"
            />
            <input
              type="date"
              value={hasta}
              min={desde || undefined}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full bg-transparent text-sm text-mar-950/60 outline-none"
            />
          </span>
        </span>
      </label>
      <label className="flex flex-1 items-center gap-3 border-t border-mar-100 px-5 py-2 sm:border-l sm:border-t-0">
        <UsersIcon />
        <span className="flex-1">
          <span className="block text-sm font-semibold text-mar-950">Huéspedes</span>
          <select value={huespedes} onChange={(e) => setHuespedes(e.target.value)} className="w-full cursor-pointer bg-transparent text-sm text-mar-950/60 outline-none">
            <option value="">¿Cuántos?</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>{n}{n === 8 ? "+" : ""}</option>
            ))}
          </select>
        </span>
      </label>
      <button
        type="submit"
        aria-label="Buscar"
        className="flex items-center justify-center rounded-2xl bg-otono-600 p-4 text-white hover:bg-otono-700 sm:rounded-full"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.5-4.5" />
        </svg>
      </button>
    </form>
  );
}
