"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CIUDADES_ES } from "@/modules/properties/geocode";

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6b5b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6b5b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12l-8 8-9-9V4h7z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6b5b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 7" />
    </svg>
  );
}

export default function SearchBar() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [max, setMax] = useState("");
  const [habs, setHabs] = useState("");

  function go(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (city) q.set("city", city);
    if (max) q.set("max", max);
    if (habs) q.set("habs", habs);
    router.push(`/buscar?${q.toString()}`);
  }

  const sel = "w-full bg-transparent text-sm text-mar-950/60 outline-none cursor-pointer";

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
        <TagIcon />
        <span className="flex-1">
          <span className="block text-sm font-semibold text-mar-950">Precio máx.</span>
          <select value={max} onChange={(e) => setMax(e.target.value)} className={sel}>
            <option value="">¿Cuánto?</option>
            <option value="1000">≤ 1.000€</option>
            <option value="1300">≤ 1.300€</option>
            <option value="1600">≤ 1.600€</option>
            <option value="2000">≤ 2.000€</option>
          </select>
        </span>
      </label>
      <label className="flex flex-1 items-center gap-3 border-t border-mar-100 px-5 py-2 sm:border-l sm:border-t-0">
        <UsersIcon />
        <span className="flex-1">
          <span className="block text-sm font-semibold text-mar-950">Habitaciones</span>
          <select value={habs} onChange={(e) => setHabs(e.target.value)} className={sel}>
            <option value="">¿Cuántas?</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
          </select>
        </span>
      </label>
      <button
        type="submit"
        aria-label="Buscar"
        className="flex items-center justify-center rounded-2xl bg-coral-500 p-4 text-white hover:bg-coral-600 sm:rounded-full"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.5-4.5" />
        </svg>
      </button>
    </form>
  );
}
