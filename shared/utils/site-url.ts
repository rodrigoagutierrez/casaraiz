import type { NextRequest } from "next/server";

// Hosts válidos para construir success/cancel/return URLs (SOC2 CC6.1).
// Prioridad: NEXT_PUBLIC_SITE_URL (prod). Si falta (preview), solo se aceptan
// localhost, *.vercel.app y el dominio canónico; cualquier otro header se ignora.
export function getSiteUrl(req: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  const raw = (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "").split(",")[0]?.trim().toLowerCase();
  const m = raw.match(/^([a-z0-9.-]+)(:\d+)?$/);
  const host = m?.[1] ?? "";
  const port = m?.[2] ?? "";
  const ok =
    host === "casaraizalquiler.com" ||
    host === "www.casaraizalquiler.com" ||
    host.endsWith(".vercel.app") ||
    host === "localhost";
  if (ok && host) {
    const scheme = host === "localhost" ? "http" : "https";
    return `${scheme}://${host}${host === "localhost" ? port || ":3000" : ""}`;
  }
  return "https://casaraizalquiler.com";
}
