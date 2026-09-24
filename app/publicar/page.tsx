"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SignInButton, useUser } from "@clerk/nextjs";
import { BARRIOS_VALENCIA } from "@/modules/content/barrios";
import { CIUDADES_ES } from "@/modules/properties/geocode";
import { ENTORNOS } from "@/modules/properties/entornos";

const inputCls = "w-full rounded-lg border border-mar-200 bg-white px-4 py-2 text-mar-950 outline-none focus:border-mar-600 focus:ring-2 focus:ring-mar-100";

type Capacity = { hasRights: boolean; limit: number | null; used: number; canPublish: boolean };

export default function PublicarPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [cap, setCap] = useState<Capacity | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/mis-pisos")
        .then((r) => r.json())
        .then((j) => setCap(j.capacity ?? null))
        .catch(() => {});
    }
  }, [isSignedIn]);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priceEur: 1200,
    rooms: 2,
    baths: 1,
    m2: 70,
    city: "Valencia",
    barrio: "ruzafa",
    entorno: "ciudad",
    address: "",
  });

  const set = (k: keyof typeof form, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (res.status === 503) {
        setError("R2 aún no configurado: pega URLs de foto abajo de momento.");
        return;
      }
      if (!res.ok) throw new Error("upload failed");
      const { url, publicUrl } = await res.json();
      const put = await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!put.ok) throw new Error("put failed");
      setPhotos((p) => [...p, publicUrl]);
    } catch {
      setError("No se pudo subir la foto. Usa URL manual.");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, city: "Valencia", photos }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.error === "NEED_OWNER_PLAN") {
          router.push("/precios");
          return;
        }
        if (json.error === "LIMIT_REACHED") {
          setError(`Límite alcanzado (${json.used}/${json.limit}). Pausa un piso o amplía tu plan.`);
          return;
        }
        setError(typeof json.error === "string" ? json.error : "Revisa título (10+), descripción (30+) y precio.");
        return;
      }
      router.push(`/p/${json.data.slug}`);
    } catch {
      setError("Error de red publicando.");
    } finally {
      setSaving(false);
    }
  }

  if (!isLoaded) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-mar-950/55">Cargando...</p>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12 text-center">
        <h1 className="text-3xl font-bold text-mar-950">Publica tu piso sin comisión</h1>
        <p className="mt-3 text-mar-950/65">Entra o crea tu cuenta para publicar. Necesitarás una suscripción de dueño.</p>
        <SignInButton mode="modal">
          <button className="mt-6 rounded-full bg-otono-600 px-6 py-3 font-medium text-white hover:bg-otono-700">
            Entrar / Crear cuenta
          </button>
        </SignInButton>
      </main>
    );
  }

  if (cap && !cap.hasRights) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12 text-center">
        <h1 className="text-3xl font-bold text-mar-950">Necesitas plan de dueño</h1>
        <p className="mt-3 text-mar-950/65">Con 19€/mes publicas hasta 3 pisos. Con 149€/año hasta 15.</p>
        <Link href="/precios" className="mt-6 inline-block rounded-full bg-mar-900 px-6 py-3 font-medium text-white hover:bg-mar-800">
          Ver planes
        </Link>
      </main>
    );
  }

  if (cap && !cap.canPublish) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12 text-center">
        <h1 className="text-3xl font-bold text-mar-950">Límite alcanzado ({cap.used}/{cap.limit})</h1>
        <p className="mt-3 text-mar-950/65">Pausa o alquila un piso, o amplía tu plan para publicar más.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/duenos" className="rounded-full border border-mar-200 bg-white px-6 py-3 font-medium text-mar-900 hover:bg-mar-50">
            Mis pisos
          </Link>
          <Link href="/precios" className="rounded-full bg-mar-900 px-6 py-3 font-medium text-white hover:bg-mar-800">
            Ampliar plan
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold text-mar-950">Publica tu piso sin comisión</h1>
      <p className="mt-2 text-sm text-mar-950/55">
        {cap ? `Te quedan ${cap.limit === null ? "∞" : (cap.limit as number) - cap.used} publicaciones.` : "Comprobando tu capacidad..."}
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4 rounded-xl border border-mar-100 bg-white p-6">
        <input
          className={inputCls}
          placeholder="Título (mín 10): Piso 2hab reformado en Ruzafa"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />
        <textarea
          className={inputCls}
          rows={4}
          placeholder="Descripción (mín 30): exterior, amueblado, metro..."
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-mar-900">Precio €/mes
            <input type="number" className={`${inputCls} mt-1`}
              value={form.priceEur} onChange={(e) => set("priceEur", Number(e.target.value))} />
          </label>
          <label className="text-sm text-mar-900">m²
            <input type="number" className={`${inputCls} mt-1`}
              value={form.m2} onChange={(e) => set("m2", Number(e.target.value))} />
          </label>
          <label className="text-sm text-mar-900">Hab.
            <input type="number" className={`${inputCls} mt-1`}
              value={form.rooms} onChange={(e) => set("rooms", Number(e.target.value))} />
          </label>
          <label className="text-sm text-mar-900">Baños
            <input type="number" className={`${inputCls} mt-1`}
              value={form.baths} onChange={(e) => set("baths", Number(e.target.value))} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-mar-900">Ciudad
            <input
              className={`${inputCls} mt-1`}
              list="ciudades-es"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              required
            />
            <datalist id="ciudades-es">
              {CIUDADES_ES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className="text-sm text-mar-900">Barrio / Zona
            <input
              className={`${inputCls} mt-1`}
              list="barrios-valencia"
              value={form.barrio}
              onChange={(e) => set("barrio", e.target.value)}
              placeholder="Ruzafa, Malasaña..."
              required
            />
            <datalist id="barrios-valencia">
              {BARRIOS_VALENCIA.map((b) => (
                <option key={b.slug} value={b.slug}>{b.nombre}</option>
              ))}
            </datalist>
          </label>
        </div>
        <label className="text-sm text-mar-900">Dirección (opcional, ayuda a situarlo en el mapa)
          <input className={`${inputCls} mt-1`}
            value={form.address} onChange={(e) => set("address", e.target.value)} />
        </label>
        <label className="text-sm text-mar-900">Entorno (así te encuentran por Playa, Montaña...)
          <select className={`${inputCls} mt-1`}
            value={form.entorno} onChange={(e) => set("entorno", e.target.value)}>
            {ENTORNOS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>

        <div className="rounded-xl border border-mar-100 bg-mar-50 p-3">
          <p className="text-sm font-medium text-mar-900">Fotos ({photos.length})</p>
          <input type="file" accept="image/*" onChange={onFile} className="mt-2 text-sm text-mar-900" />
          <div className="mt-2 flex gap-2">
            <input
              className={`${inputCls} flex-1 !py-1 text-sm`}
              placeholder="...o pega URL https://"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
            <button
              type="button"
              className="rounded-lg border border-mar-200 px-3 text-sm text-mar-900 hover:bg-white"
              onClick={() => { if (photoUrl.startsWith("http")) { setPhotos((p) => [...p, photoUrl]); setPhotoUrl(""); } }}
            >
              Añadir
            </button>
          </div>
          {photos.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-mar-950/60">
              {photos.map((u) => <li key={u} className="truncate">• {u}</li>)}
            </ul>
          )}
        </div>

        {error && <p className="text-sm text-otono-700">{error}</p>}
        <button disabled={saving} className="w-full rounded-full bg-otono-600 py-3 text-white font-medium hover:bg-otono-700 disabled:opacity-50">
          {saving ? "Publicando..." : "Publicar piso"}
        </button>
      </form>
    </main>
  );
}
