"use client";

import { useRouter } from "next/navigation";
import { CIUDADES_ES } from "@/modules/properties/geocode";
import { useI18n } from "@/modules/i18n/provider";

export default function CompactSearch({
  visible,
  idSuffix = "desk",
  city,
  setCity,
}: {
  visible: boolean;
  idSuffix?: string;
  city: string;
  setCity: (v: string) => void;
}) {
  const router = useRouter();
  const { t } = useI18n();

  function go(e: React.FormEvent) {
    e.preventDefault();
    const q = city.trim() ? `city=${encodeURIComponent(city.trim())}` : "";
    router.push(`/buscar${q ? `?${q}` : ""}`);
  }

  return (
    <form
      onSubmit={go}
      role="search"
      className={`flex flex-1 items-center justify-center transition-all duration-300 ease-out ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
      }`}
    >
      <div className="flex w-full max-w-xl items-center gap-1 rounded-full border border-mar-200 bg-white py-1.5 pl-3 pr-1.5 shadow-md">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          list={`compact-cities-${idSuffix}`}
          placeholder={t["search.lugarPlaceholder"]}
          aria-label={t["search.lugar"]}
          className="h-9 min-w-0 flex-1 bg-transparent px-1 text-sm text-mar-950 outline-none placeholder:text-mar-950/50"
        />
        <datalist id={`compact-cities-${idSuffix}`}>
          {CIUDADES_ES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <span className="hidden h-5 w-px shrink-0 bg-mar-200 min-[420px]:block" />
        <span className="hidden shrink-0 whitespace-nowrap px-2 text-sm text-mar-950/50 min-[420px]:block">{t["search.fechas"]}</span>
        <span className="hidden h-5 w-px shrink-0 bg-mar-200 min-[420px]:block" />
        <span className="hidden shrink-0 whitespace-nowrap px-2 text-sm text-mar-950/50 min-[420px]:block">{t["search.huespedes"]}</span>
        <button
          type="submit"
          aria-label={t["search.buscar"]}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-otono-600 text-white transition-transform hover:scale-105"
        >
          <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.5-4.5" />
          </svg>
        </button>
      </div>
    </form>
  );
}
