"use client";

import { useState, useTransition } from "react";
import { updateMyProfile } from "@/modules/users/profileActions";

async function uploadFile(file: File): Promise<string> {
  if (file.size > 5 * 1024 * 1024) throw new Error("UPLOAD_FAIL");
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type, contentLength: file.size }),
  });
  if (res.status === 503) throw new Error("ALMACENAMIENTO_PENDIENTE");
  if (!res.ok) throw new Error("UPLOAD_FAIL");
  const { url, publicUrl } = await res.json();
  const put = await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
  if (!put.ok) throw new Error("UPLOAD_FAIL");
  return publicUrl as string;
}

// Foto de perfil del usuario (dueño o inquilino). Visible —borrosa o nítida—
// solo para el propio usuario, el superadmin y quienes tengan reserva confirmada.
export default function ProfilePhotoForm({ initial }: { initial: string | null }) {
  const [photo, setPhoto] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
    setMsg(null);
  }

  function save() {
    setMsg(null);
    start(async () => {
      try {
        let url = photo;
        if (file) {
          url = await uploadFile(file);
        }
        if (!url) {
          setMsg("Elige una foto primero.");
          return;
        }
        await updateMyProfile({ photoUrl: url });
        setPhoto(url);
        setFile(null);
        setMsg("✓ Foto de perfil guardada.");
      } catch (e) {
        const m = e instanceof Error ? e.message : "";
        setMsg(m === "ALMACENAMIENTO_PENDIENTE" ? "Almacenamiento pendiente. Prueba en unas horas." : "No se pudo subir la foto (máx. 5MB).");
      }
    });
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-4">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="Tu foto de perfil" className="h-20 w-20 rounded-full border border-mar-100 object-cover" />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-mar-100 text-xs text-mar-700">Sin foto</div>
      )}
      <div className="min-w-[220px] flex-1">
        <input type="file" accept="image/*" onChange={pick} className="w-full text-xs" />
        {msg && <p className={`mt-1 text-xs ${msg.startsWith("✓") ? "text-green-700" : "text-otono-700"}`}>{msg}</p>}
        <button
          onClick={save}
          disabled={pending || (!file && !photo)}
          className="mt-2 rounded-full bg-mar-900 px-5 py-1.5 text-sm text-white hover:bg-mar-800 disabled:opacity-50"
        >
          {pending ? "Subiendo..." : "Guardar foto"}
        </button>
        <p className="mt-1 text-xs text-mar-950/50">
          Se usa para verificar que coincide con tu DNI. Se muestra borrada hasta que haya reserva confirmada entre usuarios.
        </p>
      </div>
    </div>
  );
}
