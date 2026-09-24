"use client";

import { useState } from "react";
import { useI18n } from "../provider";
import type { Locale } from "../dictionaries";

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z" />
    </svg>
  );
}

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);

  const options: { code: Locale; label: string; short: string }[] = [
    { code: "es", label: "Español", short: "ES" },
    { code: "en", label: "English", short: "EN" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        aria-label="Idioma"
        className="flex items-center gap-1.5 rounded-full border border-mar-200 bg-white px-3 py-1.5 text-sm font-medium text-mar-900 hover:bg-mar-50"
      >
        <GlobeIcon />
        <span className="uppercase">{lang === "es" ? "ES" : "EN"}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition ${open ? "rotate-180" : ""}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-xl border border-mar-100 bg-white shadow-lg">
          {options.map((o) => (
            <button
              key={o.code}
              onClick={() => {
                setLang(o.code);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-4 py-2 text-sm text-left hover:bg-mar-50 ${
                lang === o.code ? "font-semibold text-otono-700" : "text-mar-900"
              }`}
            >
              {o.label}
              {lang === o.code && <span className="text-otono-600">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
