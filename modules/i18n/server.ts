import { cookies } from "next/headers";
import { dictionaries, type Dict, type Locale } from "./dictionaries";

// Lee el idioma desde la cookie (para componentes servidor, p. ej. la home).
export async function getLocale(): Promise<Locale> {
  const c = await cookies();
  const v = c.get("casaraiz-lang")?.value;
  return v === "en" ? "en" : "es";
}

export async function getDict(): Promise<Dict> {
  return dictionaries[await getLocale()];
}
