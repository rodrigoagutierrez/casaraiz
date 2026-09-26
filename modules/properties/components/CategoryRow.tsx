"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/modules/i18n/provider";

function icon(path: React.ReactNode) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    { label: t["cat.playa"], href: "/buscar?entorno=playa", match: "playa", key: "playa", svg: icon(<><path d="M12 4a8 8 0 0 1 8 8H4a8 8 0 0 1 8-8z" /><path d="M12 12v6" /><path d="M9 20.5h6" /></>) },
    { label: t["cat.montana"], href: "/buscar?entorno=montana", match: "montana", key: "montana", svg: icon(<><path d="M2 20L9 6l3.5 6.5L15 9l7 11H2z" /><path d="M8.2 7.6l.8 1.4 1-1" /></>) },
    { label: t["cat.bosque"], href: "/buscar?entorno=bosque", match: "bosque", key: "bosque", svg: icon(<><path d="M12 2.5L18.5 12h-3.2L20 18.5H4L8.7 12H5.5z" /><path d="M12 18.5V21" /></>) },
    { label: t["cat.ciudad"], href: "/buscar?entorno=ciudad", match: "ciudad", key: "ciudad", svg: icon(<><path d="M4 21V4.5A1.5 1.5 0 0 1 5.5 3h5A1.5 1.5 0 0 1 12 4.5V21" /><path d="M12 9h6.5A1.5 1.5 0 0 1 20 10.5V21" /><path d="M2.5 21h19" /><path d="M7 7.5h1M7 11h1M15.5 13h1M15.5 16.5h1" /></>) },
    { label: t["cat.rio"], href: "/buscar?entorno=rio", match: "rio", key: "rio", svg: icon(<><path d="M2 9c2.2 0 2.2 2.6 4.4 2.6s2.2-2.6 4.4-2.6 2.2 2.6 4.4 2.6 2.2-2.6 4.4-2.6" /><path d="M2 15.5c2.2 0 2.2 2.6 4.4 2.6s2.2-2.6 4.4-2.6 2.2 2.6 4.4 2.6 2.2-2.6 4.4-2.6" /></>) },
    { label: t["cat.mapa"], href: "/mapa", match: "__mapa", key: "mapa", svg: icon(<><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>) },
  ];

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 items-start justify-start gap-4 overflow-x-auto px-1 py-2 snap-x sm:justify-between sm:gap-2 [scrollbar-width:thin]">
        {CATS.map((c) => {
          const on = active === c.match && c.match !== "";
          return (
            <Link
              key={c.key}
              href={c.href}
              aria-current={on ? "true" : undefined}
              className={`flex min-h-[64px] min-w-[60px] shrink-0 snap-start flex-col items-center justify-start gap-1.5 text-[11px] sm:text-xs ${
                on ? "font-bold text-otono-700" : "font-medium text-otono-700/80 hover:text-otono-700"
              }`}
            >
              <span
                className={`rounded-2xl p-3 transition ${
                  on ? "scale-105 bg-otono-700 text-white shadow-md ring-2 ring-otono-200" : "bg-otono-600 text-white hover:bg-otono-700"
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
        className="ml-1 flex h-11 shrink-0 items-center gap-2 rounded-full bg-otono-600 px-4 py-2 text-sm font-medium text-white hover:bg-otono-700 sm:ml-3 sm:px-5"
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
