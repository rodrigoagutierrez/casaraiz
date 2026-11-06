"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Aceptación expresa de T&C + privacidad (checkbox post-registro). Clerk gestiona
// el alta y no permite poner el checkbox allí; esta es la constancia de la
// aceptación en la primera visita a /mi-cuenta. Sin ella no se verifica,
// contacta, chatea ni reserva (gates en la API: error SIN_TERMINOS).
export default function TermsGate() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function accept() {
    setMsg(null);
    start(async () => {
      try {
        const { acceptTerms } = await import("@/modules/users/actions");
        await acceptTerms();
        router.refresh();
      } catch {
        setMsg("No se pudo guardar. Prueba de nuevo.");
      }
    });
  }

  return (
    <section className="mt-6 rounded-2xl border border-otono-200 bg-otono-100 p-5">
      <p className="font-semibold text-mar-900">Acepta los términos para continuar</p>
      <p className="mt-1 text-sm text-mar-950/70">
        Antes de verificar tu identidad, contactar con dueños o reservar, acepta nuestros Términos y
        condiciones y la Política de privacidad.
      </p>
      <label className="mt-3 flex items-start gap-2 text-sm text-mar-900">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-otono-600"
        />
        <span>
          He leído y acepto los{" "}
          <Link href="/legal/terminos" target="_blank" className="font-medium underline">
            Términos y condiciones
          </Link>{" "}
          y la{" "}
          <Link href="/legal/privacidad" target="_blank" className="font-medium underline">
            Política de privacidad
          </Link>
          .
        </span>
      </label>
      <button
        onClick={accept}
        disabled={!checked || pending}
        className="mt-3 rounded-full bg-otono-600 px-5 py-2 text-sm text-white hover:bg-otono-700 disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Aceptar y continuar"}
      </button>
      {msg && <p className="mt-2 text-sm text-otono-700">{msg}</p>}
    </section>
  );
}
