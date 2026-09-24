"use client";

import { useState, useTransition } from "react";
import { submitVerification } from "@/modules/users/actions";

async function uploadFile(file: File): Promise<string> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });
  if (res.status === 503) throw new Error("ALMACENAMIENTO_PENDIENTE");
  if (!res.ok) throw new Error("UPLOAD_FAIL");
  const { url, publicUrl } = await res.json();
  const put = await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
  if (!put.ok) throw new Error("UPLOAD_FAIL");
  return publicUrl as string;
}

export default function VerificationForm() {
  const [docType, setDocType] = useState<"dni" | "pasaporte">("dni");
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function send() {
    setMsg(null);
    start(async () => {
      try {
        if (!front || !back) {
          setMsg("Sube anverso y reverso del documento.");
          return;
        }
        const [frontUrl, backUrl] = await Promise.all([uploadFile(front), uploadFile(back)]);
        await submitVerification({ docType, frontUrl, backUrl });
        setMsg("Recibido. Revisaremos tu documento en 24-48h.");
      } catch (e) {
        const m = e instanceof Error ? e.message : "";
        setMsg(m === "ALMACENAMIENTO_PENDIENTE" ? "Estamos activando el almacenamiento seguro. Prueba en unas horas." : "No se pudo enviar. Prueba de nuevo.");
      }
    });
  }

  const input = "w-full rounded-lg border border-mar-200 bg-white px-3 py-2 text-sm outline-none focus:border-mar-600";

  return (
    <div className="mt-3 space-y-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <select value={docType} onChange={(e) => setDocType(e.target.value as "dni" | "pasaporte")} className={input}>
          <option value="dni">DNI / NIE</option>
          <option value="pasaporte">Pasaporte</option>
        </select>
        <label className={input}>Anverso<input type="file" accept="image/*" className="mt-1 w-full text-xs" onChange={(e) => setFront(e.target.files?.[0] ?? null)} /></label>
        <label className={input}>Reverso<input type="file" accept="image/*" className="mt-1 w-full text-xs" onChange={(e) => setBack(e.target.files?.[0] ?? null)} /></label>
      </div>
      {msg && <p className="text-sm text-mar-900">{msg}</p>}
      <button onClick={send} disabled={pending} className="rounded-full bg-mar-900 px-5 py-2 text-sm text-white hover:bg-mar-800 disabled:opacity-50">
        {pending ? "Enviando..." : "Enviar para verificación"}
      </button>
      <p className="text-xs text-mar-950/50">Tus documentos solo los ve el equipo de verificación. Nunca se muestran a otros usuarios.</p>
    </div>
  );
}
