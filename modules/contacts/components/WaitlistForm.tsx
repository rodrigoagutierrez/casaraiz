"use client";

import { useState } from "react";

const OPCIONES = [
  { v: "inquilino", l: "Quiero alquilar (inquilino)" },
  { v: "dueno", l: "Tengo pisos (dueño)" },
  { v: "ambos", l: "Ambos" },
] as const;

type Estado = "idle" | "enviando" | "ok" | "error";

export default function WaitlistForm({ ciudadInicial = "" }: { ciudadInicial?: string }) {
  const [email, setEmail] = useState("");
  const [ciudad, setCiudad] = useState(ciudadInicial);
  const [tipo, setTipo] = useState<string>("inquilino");
  const [empresa, setEmpresa] = useState(""); // honeypot
  const [estado, setEstado] = useState<Estado>("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (estado === "enviando") return;
    setEstado("enviando");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ciudad, tipo, empresa }),
      });
      if (!res.ok) throw new Error("WAITLIST_ERROR");
      setEstado("ok");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "ok") {
    return (
      <div className="rounded-2xl border border-mar-100 bg-white p-6 text-center">
        <p className="text-lg font-semibold text-mar-900">¡Estás en la lista!</p>
        <p className="mt-2 text-sm text-mar-950/70">
          Te avisaremos en <span className="font-medium">{email}</span>
          {ciudad ? <> en cuanto CasaRaiz esté disponible en {ciudad}</> : " en cuanto tengamos novedades"}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-mar-100 bg-white p-6">
      <div>
        <label htmlFor="wl-email" className="block text-xs font-medium text-mar-900 mb-1">
          Email
        </label>
        <input
          id="wl-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full rounded-lg border border-mar-200 bg-white px-3 py-2 text-sm text-mar-950 outline-none focus:border-mar-600"
        />
      </div>

      <div>
        <label htmlFor="wl-ciudad" className="block text-xs font-medium text-mar-900 mb-1">
          Ciudad
        </label>
        <input
          id="wl-ciudad"
          type="text"
          required
          minLength={2}
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          placeholder="Madrid, Sevilla, Barcelona…"
          className="w-full rounded-lg border border-mar-200 bg-white px-3 py-2 text-sm text-mar-950 outline-none focus:border-mar-600"
        />
      </div>

      <div>
        <label htmlFor="wl-tipo" className="block text-xs font-medium text-mar-900 mb-1">
          Tipo de usuario
        </label>
        <select
          id="wl-tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full rounded-lg border border-mar-200 bg-white px-3 py-2 text-sm text-mar-950 outline-none focus:border-mar-600"
        >
          {OPCIONES.map((o) => (
            <option key={o.v} value={o.v}>
              {o.l}
            </option>
          ))}
        </select>
      </div>

      {/* Honeypot: invisible para los usuarios, trampa para los bots */}
      <input
        type="text"
        name="empresa"
        value={empresa}
        onChange={(e) => setEmpresa(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {estado === "error" && (
        <p className="text-xs text-red-600">No hemos podido guardar tu email. Inténtalo otra vez o escríbenos a hola@casaraizalquiler.com.</p>
      )}

      <button
        type="submit"
        disabled={estado === "enviando"}
        className="w-full rounded-full bg-otono-600 px-6 py-3 text-sm font-medium text-white hover:bg-otono-700 disabled:opacity-50"
      >
        {estado === "enviando" ? "Enviando…" : "Avisadme cuando esté disponible"}
      </button>
    </form>
  );
}
