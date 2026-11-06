"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useI18n } from "@/modules/i18n/provider";

// Banner de consentimiento de cookies (art. 22.2 LSSI + política de cookies).
// La elección se guarda en localStorage ('casaraiz-consent') y se aplica al
// Consent Mode de gtag (ver shared/ui/GoogleAnalytics.tsx): por defecto todo
// denegado; solo "granted" activa la analítica. Sin aceptación no hay cookies
// de medición, así que el banner puede ignorarse con tranquilidad.
//
// Se lee con useSyncExternalStore: el servidor no conoce localStorage, así que
// en SSR/hidratación se asume decisión tomada (no se pinta) y tras la
// hidratación React re-renderiza con el valor real de localStorage (sin mismatch).
const KEY = "casaraiz-consent";

// Decisión tomada en esta pestaña (si el storage está bloqueado, vive solo aquí)
let sessionChoice: string | null = null;
const listeners = new Set<() => void>();

function readConsent(): string {
  if (sessionChoice !== null) return sessionChoice;
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange); // cambios en otras pestañas
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot() {
  return readConsent();
}

// El servidor no puede leer localStorage: asume "decidido" para no pintar el
// banner en el HTML. Tras la hidratación React consulta getSnapshot() y, si no
// hay decisión, el banner aparece (visitantes nuevos) sin que los que ya
// eligieron lo vean parpadear en cada carga.
function getServerSnapshot() {
  return "granted";
}

function notify() {
  listeners.forEach((l) => l());
}

export default function CookieBanner() {
  const { t } = useI18n();
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function decide(choice: "granted" | "denied") {
    sessionChoice = choice;
    try {
      localStorage.setItem(KEY, choice);
    } catch {
      // sin storage no hay persistencia; el modo denegado por defecto sigue
    }
    if (choice === "granted") {
      const w = window as unknown as { gtag?: (...args: unknown[]) => void };
      if (typeof w.gtag === "function") w.gtag("consent", "update", { analytics_storage: "granted" });
    }
    notify();
  }

  // "" = sin decisión todavía → se muestra el banner
  if (consent !== "") return null;

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-mar-200 bg-white/95 p-4 shadow-[0_-2px_12px_rgba(6,38,64,0.15)] backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-mar-950/75">
          {t["cookie.texto"]}{" "}
          <Link href="/legal/cookies" className="font-medium underline">
            {t["cookie.politica"]}
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => decide("denied")}
            className="rounded-full border border-mar-300 px-4 py-2 text-sm text-mar-900 hover:bg-mar-50"
          >
            {t["cookie.rechazar"]}
          </button>
          <button
            onClick={() => decide("granted")}
            className="rounded-full bg-otono-600 px-5 py-2 text-sm text-white hover:bg-otono-700"
          >
            {t["cookie.aceptar"]}
          </button>
        </div>
      </div>
    </div>
  );
}
