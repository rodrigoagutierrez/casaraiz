"use client";

import { useState, useTransition } from "react";
import { updateSuperadminProfile } from "@/modules/users/profileActions";

type Initial = {
  email?: string;
  photoUrl?: string | null;
  whatsapp?: string | null;
  contactEmail?: string | null;
};

export default function ProfileForm({ initial }: { initial: Initial }) {
  const [photoUrl, setPhotoUrl] = useState(initial.photoUrl ?? "");
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp ?? "");
  const [contactEmail, setContactEmail] = useState(initial.contactEmail ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [photoFile, setPhotoFile] = useState<File | null>(null);

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
    const email = contactEmail.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMsg("Error: el email de contacto no es válido.");
      return;
    }
    start(async () => {
      try {
        await updateSuperadminProfile({
          photoUrl: photoUrl || null,
          whatsapp: whatsapp || null,
          contactEmail: email || null,
        });
        setMsg("Perfil guardado.");
      } catch (e) {
        setMsg(`Error: ${e instanceof Error ? e.message : "desconocido"}`);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-mar-100 bg-white p-6">
      <p className="mb-6 font-semibold text-mar-900">Foto de perfil (se muestra en «Quiénes somos»)</p>

      <div className="mb-4 flex flex-col items-start gap-4 sm:flex-row">
        <div className="flex-shrink-0">
          {photoUrl ? (
            <img src={photoUrl} alt="Perfil" className="h-32 w-32 rounded-full border border-mar-200 object-cover" />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-mar-100">
              <span className="text-3xl text-mar-900/40">👤</span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-mar-900">Subir foto</label>
          <input type="file" accept="image/*" onChange={onFile} className="block w-full text-sm text-mar-900" />
          {photoFile && <p className="mt-1 text-xs text-mar-950/50">{photoFile.name}</p>}
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-1 block text-xs font-medium text-mar-900">WhatsApp</label>
        <input
          type="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="+34 600 000 000"
          className="w-full rounded-lg border border-mar-200 bg-white px-3 py-2 text-sm outline-none focus:border-mar-600"
        />
        <p className="mt-1 text-xs text-mar-950/50">Formato internacional, ej: +34600000000</p>
      </div>

      <div className="mt-6">
        <label className="mb-1 block text-xs font-medium text-mar-900">Email de contacto</label>
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="contacto@casaraizalquiler.com"
          className="w-full rounded-lg border border-mar-200 bg-white px-3 py-2 text-sm outline-none focus:border-mar-600"
        />
        <p className="mt-1 text-xs text-mar-950/50">
          Es el correo público que aparece en «Quiénes somos» y donde te escribirán. Déjalo vacío para usar el de tu
          cuenta ({initial.email}).
        </p>
      </div>

      {msg && (
        <p className={`mt-3 text-xs ${msg.startsWith("Error") ? "text-otono-700" : "text-green-700"}`}>{msg}</p>
      )}

      <button
        onClick={save}
        disabled={pending}
        className="mt-4 rounded-full bg-mar-900 px-5 py-2 text-sm font-medium text-white hover:bg-mar-800 disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );
}
