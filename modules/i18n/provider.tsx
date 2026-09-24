"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { dictionaries, type Dict, type Locale } from "./dictionaries";

const COOKIE = "casaraiz-lang";

type Ctx = {
  lang: Locale;
  t: Dict;
  setLang: (l: Locale) => void;
};

const I18nContext = createContext<Ctx>({ lang: "es", t: dictionaries.es, setLang: () => {} });

export function I18nProvider({ children, initialLang = "es" }: { children: React.ReactNode; initialLang?: Locale }) {
  const [lang, setLangState] = useState<Locale>(initialLang);

  const setLang = useCallback((l: Locale) => {
    setLangState(l);
    if (typeof document !== "undefined") {
      document.cookie = `${COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    }
  }, []);

  const value = useMemo<Ctx>(() => ({ lang, t: dictionaries[lang], setLang }), [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
