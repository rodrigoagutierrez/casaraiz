"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CIUDADES_ES } from "@/modules/properties/geocode";
import { useI18n } from "@/modules/i18n/provider";

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#bc5f1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function CalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#bc5f1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#bc5f1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 7" />
    </svg>
  );
}

function SearchGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.5-4.5" />
    </svg>
  );
}

export default function SearchBar() {
  const { t } = useI18n();
  const router = useRouter();
  const [city, setCity] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [huespedes, setHuespedes] = useState("");
  const [open, setOpen] = useState(false);

  function go(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (city) q.set("city", city);
    if (desde) q.set("desde", desde);
    if (hasta) q.set("hasta", hasta);
    if (huespedes) q.set("huespedes", huespedes);
    router.push(`/buscar?${q.toString()}`);
  }

  const summary = [city || null, desde || hasta ? `${desde || "…"} → ${hasta || "…"}` : null, huespedes ? `${huespedes} huésp.` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      {/* Pill compacta solo móvil: abre el buscador completo */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-auto flex w-full max-w-3xl items-center gap-3 rounded-full bg-white px-5 py-3.5 text-left shadow-2xl md:hidden"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-otono-600 text-white">
          <SearchGlyph size={16} />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-mar-950">
          {summary || t["search.lugarPlaceholder"]}
        </span>
      </button>

      {/* Buscador completo: siempre visible en desktop, expandible en móvil */}
      <form
        onSubmit={go}
        className={`${open ? "flex" : "hidden"} mx-auto mt-2 max-w-3xl flex-col gap-1 rounded-3xl bg-white p-2 text-left shadow-2xl md:mt-0 md:flex md:flex-row md:items-stretch md:rounded-full`}
      >
        <div className="flex items-center justify-between px-5 pt-2 md:hidden">
          <span className="text-sm font-semibold text-mar-950">{t["search.buscar"]}</span>
          <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar" className="flex h-9 w-9 items-center justify-center rounded-full border border-mar-200 text-mar-900">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <label className="flex flex-1 items-center gap-3 px-5 py-2">
          <PinIcon />
          <span className="flex-1">
            <span className="block text-sm font-semibold text-mar-950">{t["search.lugar"]}</span>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              list="ciudades-hero"
              placeholder={t["search.lugarPlaceholder"]}
              className="h-11 w-full bg-transparent text-base text-mar-950/60 outline-none placeholder:text-mar-950/60 sm:h-auto sm:text-sm"
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
            <span className="block text-sm font-semibold text-mar-950">{t["search.fechas"]}</span>
            <span className="flex flex-col gap-1 sm:flex-row sm:items-center">
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                aria-label="Check-in"
                className="h-11 w-full min-w-0 bg-transparent text-base text-mar-950/60 outline-none [color-scheme:light] sm:h-auto sm:text-sm"
              />
              <input
                type="date"
                value={hasta}
                min={desde || undefined}
                onChange={(e) => setHasta(e.target.value)}
                aria-label="Check-out"
                className="h-11 w-full min-w-0 bg-transparent text-base text-mar-950/60 outline-none [color-scheme:light] sm:h-auto sm:text-sm"
              />
            </span>
          </span>
        </label>
        <label className="flex flex-1 items-center gap-3 border-t border-mar-100 px-5 py-2 sm:border-l sm:border-t-0">
          <UsersIcon />
          <span className="flex-1">
            <span className="block text-sm font-semibold text-mar-950">{t["search.huespedes"]}</span>
            <select value={huespedes} onChange={(e) => setHuespedes(e.target.value)} className="h-11 w-full cursor-pointer bg-transparent text-base text-mar-950/60 outline-none sm:h-auto sm:text-sm">
              <option value="">{t["search.cuantos"]}</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n}{n === 8 ? "+" : ""}</option>
              ))}
            </select>
          </span>
        </label>
        <button
          type="submit"
          aria-label={t["search.buscar"]}
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-otono-600 p-4 font-semibold text-white hover:bg-otono-700 sm:rounded-full"
        >
          <SearchGlyph />
          <span className="md:hidden">{t["search.buscar"]}</span>
        </button>
      </form>
    </>
  );
}
