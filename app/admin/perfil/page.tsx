"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateSuperadminProfile, getSuperadminProfile } from "@/modules/users/profileActions";

const input = "w-full rounded-lg border border-mar-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-mar-600";

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<{ email?: string; photoUrl?: string | null; whatsapp?: string | null } | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const load = async () => {
    const p = await getSuperadminProfile();
    setProfile(p);
    setPhotoUrl(p?.photoUrl ?? "");
    setWhatsapp(p?.whatsapp ?? "");
  };

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  load();

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setMsg("Subiendo foto...");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, contentLength: file.size }),
      });
      if (res.status === 503) {
        setMsg("R2 no configurado: no se pudo subir la foto.");
        return;
      }
      if (!res.ok) throw new Error("upload failed");
      const { url, publicUrl } = await res.json();
      const put = await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!put.ok) throw new Error("put failed");
      setPhotoUrl(publicUrl);
      setMsg("Foto subida. Guarda los cambios.");
    } catch {
      setMsg("No se pudo subir la foto. Intenta de nuevo.");
    }
  }

  function save() {
    start(async () => {
      try {
        await updateSuperadminProfile({ photoUrl: photoUrl || null, whatsapp: whatsapp || null });
        setMsg("Perfil guardado.");
        await load();
      } catch (e) {
        setMsg(`Error: ${e instanceof Error ? e.message : "desconocido"}`);
      }
    });
  }

  if (!profile) return <p>Cargando perfil...</p>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="text-sm text-mar-600 hover:text-mar-800">← Volver al panel</Link>
        <h1 className="text-2xl font-bold text-mar-900">Mi perfil (superadmin)</h1>
      </div>

      <div className="rounded-2xl border border-mar-100 bg-white p-6">
        <p className="font-semibold text-mar-900 mb-6">Foto de perfil (se muestra en "Quiénes somos")</p>

        <div className="flex flex-col sm:flex-row gap-4 items-start mb-4">
          <div className="flex-shrink-0">
            {photoUrl ? (
              <img src={photoUrl} alt="Perfil" className="w-32 h-32 rounded-full object-cover border border-mar-200" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-mar-100 flex items-center justify-center">
                <span className="text-mar-900/40 text-3xl">👤</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-mar-900 mb-1">Subir foto</label>
            <input type="file" accept="image/*" onChange={onFile} className="block w-full text-sm text-mar-900" />
            {photoFile && <p className="text-xs text-mar-950/50 mt-1">{photoFile.name}</p>}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-xs font-medium text-mar-900 mb-1">WhatsApp</label>
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+34 600 000 000"
            className="w-full rounded-lg border border-mar-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-mar-600"
          />
          <p className="text-xs text-mar-950/50 mt-1">Formato internacional, ej: +34600000000</p>
        </div>

        {msg && <p className={`mt-3 text-xs ${msg.startsWith("Error") ? "text-otono-700" : "text-green-700"}`}>{msg}</p>}

        <button
          onClick={save}
          disabled={pending}
          className="mt-4 rounded-full bg-mar-900 px-5 py-2 text-sm font-medium text-white hover:bg-mar-800 disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
