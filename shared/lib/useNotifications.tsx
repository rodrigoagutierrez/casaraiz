"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export type NotificationCounts = { messages: number; reservations: number };

const EMPTY: NotificationCounts = { messages: 0, reservations: 0 };

// Contadores de notificaciones en vivo. Sondea /api/notifications mientras
// hay sesión: al montar, cada 20s y al recuperar el foco de la pestaña
// (visibilitychange). Al volver a 0 (p. ej. al abrir un hilo) se actualiza
// sin esperar al siguiente tick porque el hook se re-sondea al foco.
export function useNotifications() {
  const { isSignedIn } = useUser();
  const [counts, setCounts] = useState<NotificationCounts>(EMPTY);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const json = await res.json();
      if (json?.data) {
        setCounts({
          messages: Number(json.data.messages) || 0,
          reservations: Number(json.data.reservations) || 0,
        });
      }
    } catch {
      // sin red: se mantiene el último contador
    }
  }, []);

  useEffect(() => {
    if (!isSignedIn) return; // sin sesión: los badges no se pintan (Header los oculta)
    const id = setTimeout(refresh, 0); // fuera del cuerpo del effect (react-hooks/set-state-in-effect)
    const t = setInterval(refresh, 20_000);
    const onFocus = () => refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(id);
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isSignedIn, refresh]);

  return counts;
}

// Punto rojo/contador. n=0 no pinta nada.
export function Badge({ n, className = "" }: { n: number; className?: string }) {
  if (n <= 0) return null;
  return (
    <span
      className={`ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white ${className}`}
      aria-label={`${n} sin leer`}
    >
      {n > 9 ? "9+" : n}
    </span>
  );
}
