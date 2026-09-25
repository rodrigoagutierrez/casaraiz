"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CIUDADES_ES } from "@/modules/properties/geocode";
import { useI18n } from "@/modules/i18n/provider";

export default function CompactSearch({ visible }: { visible: boolean }) {
  const router = useRouter();
  const { t } = useI18n();
  const [city, setCity] = useState("");

  function go(e: React.FormEvent) {
    e.preventDefault();
    const q = city.trim() ? `city=${encodeURIComponent(city.trim())}` : "";
    router.push(`/buscar${q ? `?${q}` : ""}`);
  }

  return (
    <form
      onSubmit={go}
      className={`hidden flex-1 items-center justify-center transition-all duration-300 ease-out lg:flex ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
      }`}
    >
      <div className="flex items-center gap-1 rounded-full border border-mar-200 bg-white py-1.5 pl-3 pr-1.5 shadow-md transition-shadow hover:shadow-lg">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          list="compact-cities"
          placeholder={t["search.lugarPlaceholder"]}
          className="w-32 bg-transparent px-1 text-sm text-mar-950 outline-none placeholder:text-mar-950/50"
        />
        <datalist id="compact-cities">
          {CIUDADES_ES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <span className="h-5 w-px bg-mar-200" />
        <span className="px-2 text-sm text-mar-950/50">{t["search.fechas"]}</span>
        <span className="h-5 w-px bg-mar-200" />
        <span className="px-2 text-sm text-mar-950/50">{t["search.huespedes"]}</span>
        <button
          type="submit"
          aria-label="Buscar"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-otono-600 text-white transition-transform hover:scale-105"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.5-4.5" />
          </svg>
        </button>
      </div>
    </form>
  );
}
