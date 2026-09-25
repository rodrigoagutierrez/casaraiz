"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ENTORNOS } from "@/modules/properties/entornos";

type Prop = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  rooms: number;
  baths: number;
  m2: number;
  address: string | null;
  city: string;
  maxHuespedes: number;
  disponibleDesde: string | null;
  disponibleHasta: string | null;
  barrio: string;
  entorno: string | null;
  photos: string[];
  status: "draft" | "active" | "rented";
};

const inputCls = "w-full rounded-lg border border-mar-200 bg-white px-4 py-2 text-mar-950 outline-none focus:border-mar-600 focus:ring-2 focus:ring-mar-100";

export default function EditForm({ initial }: { initial: Prop }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: initial.title,
    description: initial.description,
    priceEur: initial.priceCents / 100,
    rooms: initial.rooms,
    baths: initial.baths,
    m2: initial.m2,
    barrio: initial.barrio,
    city: initial.city,
    maxHuespedes: initial.maxHuespedes,
    disponibleDesde: initial.disponibleDesde ?? "",
    disponibleHasta: initial.disponibleHasta ?? "",
    entorno: initial.entorno ?? "ciudad",
    address: initial.address ?? "",
    status: initial.status,
  });

  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        photos: initial.photos,
        disponibleDesde: form.disponibleDesde || null,
        disponibleHasta: form.disponibleHasta || null,
      };
      const res = await fetch(`/api/properties/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setError("No se pudo guardar. Revisa los campos.");
        return;
      }
      router.push("/duenos");
      router.refresh();
    } catch {
      setError("Error de red.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-mar-100 bg-white p-6">
      <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} required />
      <textarea className={inputCls} rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} required />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm text-mar-900">Precio €/noche
          <input type="number" className={`${inputCls} mt-1`} value={form.priceEur} onChange={(e) => set("priceEur", Number(e.target.value))} />
        </label>
        <label className="text-sm text-mar-900">m²
          <input type="number" className={`${inputCls} mt-1`} value={form.m2} onChange={(e) => set("m2", Number(e.target.value))} />
        </label>
        <label className="text-sm text-mar-900">Hab.
          <input type="number" className={`${inputCls} mt-1`} value={form.rooms} onChange={(e) => set("rooms", Number(e.target.value))} />
        </label>
          <label className="text-sm text-mar-900">Baños
            <input type="number" className={`${inputCls} mt-1`} value={form.baths} onChange={(e) => set("baths", Number(e.target.value))} />
          </label>
          <label className="text-sm text-mar-900">Huéspedes máx.
            <input type="number" min={1} max={16} className={`${inputCls} mt-1`} value={form.maxHuespedes} onChange={(e) => set("maxHuespedes", Number(e.target.value))} />
          </label>
          <label className="text-sm text-mar-900">Disponible desde
            <input type="date" className={`${inputCls} mt-1`} value={form.disponibleDesde} onChange={(e) => set("disponibleDesde", e.target.value)} />
          </label>
          <label className="text-sm text-mar-900">Disponible hasta (vacío = siempre)
            <input type="date" className={`${inputCls} mt-1`} value={form.disponibleHasta} onChange={(e) => set("disponibleHasta", e.target.value)} />
          </label>
        </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm text-mar-900">Ciudad
          <input className={`${inputCls} mt-1`} value={form.city} onChange={(e) => set("city", e.target.value)} required />
        </label>
        <label className="text-sm text-mar-900">Barrio / Zona
          <input className={`${inputCls} mt-1`} value={form.barrio} onChange={(e) => set("barrio", e.target.value)} required />
        </label>
      </div>
        <label className="text-sm text-mar-900">Estado
          <select className={`${inputCls} mt-1`} value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="active">Activo (visible)</option>
            <option value="draft">Pausado (oculto)</option>
            <option value="rented">Alquilado</option>
          </select>
        </label>
      <label className="text-sm text-mar-900">Entorno
        <select className={`${inputCls} mt-1`} value={form.entorno} onChange={(e) => set("entorno", e.target.value)}>
          {ENTORNOS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>
      {error && <p className="text-sm text-otono-700">{error}</p>}
      <button disabled={saving} className="w-full rounded-full bg-mar-900 py-3 text-white font-medium hover:bg-mar-800 disabled:opacity-50">
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
