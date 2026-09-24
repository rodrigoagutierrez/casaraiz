"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/modules/i18n/provider";

function icon(path: React.ReactNode) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  );
}

export default function CategoryRow() {
  const { t } = useI18n();
  const sp = useSearchParams();
  const active = sp.get("entorno") ?? "";

  const CATS = [
    { label: t["cat.todos"], href: "/buscar", match: "", key: "todos", svg: icon(<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.5-4.5" /></>) },
    { label: t["cat.playa"], href: "/buscar?entorno=playa", match: "playa", key: "playa", svg: icon(<><path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z" /><path d="M12 12v7" /><path d="M8 21h8" /></>) },
    { label: t["cat.montana"], href: "/buscar?entorno=montana", match: "montana", key: "montana", svg: icon(<><path d="M3 20l6-11 4 6 3-4 5 9z" /></>) },
    { label: t["cat.bosque"], href: "/buscar?entorno=bosque", match: "bosque", key: "bosque", svg: icon(<><path d="M12 3l5 8h-3l4 6H6l4-6H7z" /><path d="M12 17v4" /></>) },
    { label: t["cat.ciudad"], href: "/buscar?entorno=ciudad", match: "ciudad", key: "ciudad", svg: icon(<><rect x="4" y="3" width="7" height="18" /><rect x="13" y="8" width="7" height="13" /><path d="M7 21v-3h1v3" /></>) },
    { label: t["cat.rio"], href: "/buscar?entorno=rio", match: "rio", key: "rio", svg: icon(<><path d="M2 8c2.5 0 2.5 3 5 3s2.5-3 5-3 2.5 3 5 3 2.5-3 5-3" /><path d="M2 15c2.5 0 2.5 3 5 3s2.5-3 5-3 2.5 3 5 3 2.5-3 5-3" /></>) },
    { label: t["cat.mapa"], href: "/mapa", match: "__mapa", key: "mapa", svg: icon(<><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>) },
  ];

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-1 items-start justify-start gap-5 overflow-x-auto px-1 py-1 sm:justify-between sm:gap-2">
        {CATS.map((c) => {
          const on = active === c.match && c.match !== "";
          return (
            <Link
              key={c.key}
              href={c.href}
              className={`flex shrink-0 flex-col items-center gap-1.5 text-xs ${
                on ? "font-bold text-otono-700" : "font-medium text-otono-600/70 hover:text-otono-700"
              }`}
            >
              <span
                className={`rounded-2xl p-2.5 transition ${
                  on ? "scale-105 bg-otono-700 text-white shadow-md" : "bg-otono-600 text-white hover:bg-otono-700"
                }`}
              >
                {c.svg}
              </span>
              {c.label}
            </Link>
          );
        })}
      </div>
      <Link
        href="/buscar"
        className="ml-6 flex shrink-0 items-center gap-2 rounded-full bg-otono-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-otono-700"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 8h10M18 8h2M4 16h2M10 16h10" />
          <circle cx="16" cy="8" r="2" />
          <circle cx="8" cy="16" r="2" />
        </svg>
        {t["cat.filtros"]}
      </Link>
    </div>
  );
}
