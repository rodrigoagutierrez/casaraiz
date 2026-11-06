"use client";

import { useState } from "react";
import Link from "next/link";
import { SignInButton, useUser } from "@clerk/nextjs";
import { trackEvent } from "@/shared/lib/analytics";

export default function ContactBox({ propertyId, verified }: { propertyId: string; verified?: boolean }) {
  const { isSignedIn } = useUser();
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "need_membership" | "need_verification" | "need_terms" | "error">("idle");

  if (!isSignedIn) {
    return (
      <div>
        <p className="mt-1 text-mar-950/55">Entra para contactar al dueño directo.</p>
        <SignInButton mode="modal">
          <button className="mt-3 rounded-full bg-otono-600 px-5 py-2 text-white hover:bg-otono-700">
            Entrar para contactar
          </button>
        </SignInButton>
      </div>
    );
  }

  if (state === "done") {
    return <p className="mt-3 rounded-xl bg-mar-50 p-4 text-sm text-mar-900">✓ Contacto enviado. El dueño te responderá por email.</p>;
  }

  // Solo usuarios verificados contactan (antes: solo consulta pública)
  if (!verified) {
    return (
      <div>
        <p className="mt-1 text-mar-950/55">
          Para contactar al dueño, verifica tu identidad primero (DNI y foto de perfil). Es gratis y tarda 24-48h.
        </p>
        <Link
          href="/mi-cuenta"
          className="mt-3 inline-block rounded-full border border-otono-200 bg-otono-100 px-5 py-2 text-sm font-medium text-otono-700 hover:bg-otono-200"
        >
          Verificar mi identidad
        </Link>
      </div>
    );
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, message: message || undefined }),
      });
      if (res.status === 403) {
        const json = await res.json().catch(() => ({}));
        if (json.error === "SIN_TERMINOS") {
          setState("need_terms");
          return;
        }
        setState(json.error === "NO_VERIFICADO" ? "need_verification" : "need_membership");
        return;
      }
      if (!res.ok) {
        setState("error");
        return;
      }
      trackEvent("contact_owner", { property_id: propertyId });
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={send} className="mt-3">
      <textarea
        className="w-full rounded-lg border border-mar-200 bg-white px-4 py-2 text-sm text-mar-950 outline-none focus:border-mar-600 focus:ring-2 focus:ring-mar-100"
        rows={3}
        placeholder="Hola, me interesa tu piso... (mín 10 caracteres)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      {state === "need_membership" && (
        <p className="mt-2 rounded-xl bg-otono-100 p-3 text-sm text-otono-700">
          Necesitas una cuenta con membresía para contactar.{" "}
          <Link href="/precios" className="font-semibold underline">Ver planes de dueño</Link>
        </p>
      )}
      {state === "need_verification" && (
        <p className="mt-2 rounded-xl bg-otono-100 p-3 text-sm text-otono-700">
          Verifica tu identidad para contactar.{" "}
          <Link href="/mi-cuenta" className="font-semibold underline">Ir a verificación</Link>
        </p>
      )}
      {state === "need_terms" && (
        <p className="mt-2 rounded-xl bg-otono-100 p-3 text-sm text-otono-700">
          Acepta los Términos y la Política de privacidad para contactar.{" "}
          <Link href="/mi-cuenta" className="font-semibold underline">Ir a Mi cuenta</Link>
        </p>
      )}
      {state === "error" && <p className="mt-2 text-sm text-otono-700">No se pudo enviar. Prueba de nuevo.</p>}
      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-3 rounded-full bg-otono-600 px-5 py-2 text-white hover:bg-otono-700 disabled:opacity-50"
      >
        {state === "sending" ? "Enviando..." : "Contactar"}
      </button>
    </form>
  );
}
