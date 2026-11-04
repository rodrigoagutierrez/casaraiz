// Helper mínimo para enviar eventos a GA4 (gtag.js).
// Seguro en SSR: no hace nada si window/gtag no existen.
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === "function") {
    w.gtag("event", name, params ?? {});
  }
}
