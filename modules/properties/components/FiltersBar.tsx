"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ENTORNOS } from "@/modules/properties/entornos";
import { CIUDADES_ES } from "@/modules/properties/geocode";

export default function FiltersBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const [barrio, setBarrio] = useState(sp.get("barrio") ?? "");
  const [city, setCity] = useState(sp.get("city") ?? "");
  const [entorno, setEntorno] = useState(sp.get("entorno") ?? "");
  const [habs, setHabs] = useState(sp.get("habs") ?? "");
  const [baths, setBaths] = useState(sp.get("baths") ?? "");
  const [min, setMin] = useState(sp.get("min") ?? "");
  const [max, setMax] = useState(sp.get("max") ?? "");
  const [m2, setM2] = useState(sp.get("m2") ?? "");
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [orden, setOrden] = useState(sp.get("orden") ?? "nuevos");

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (barrio) p.set("barrio", barrio);
    if (city) p.set("city", city);
    if (entorno) p.set("entorno", entorno);
    if (habs) p.set("habs", habs);
    if (baths) p.set("baths", baths);
    if (min) p.set("min", min);
    if (max) p.set("max", max);
    if (m2) p.set("m2", m2);
    if (q) p.set("q", q);
    if (orden !== "nuevos") p.set("orden", orden);
    router.push(`/buscar?${p.toString()}`);
  }

  const f = "rounded-full border border-mar-200 bg-white px-3 py-1.5 text-sm text-mar-950 outline-none focus:border-mar-600";

  return (
    <form onSubmit={apply} className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-mar-100 bg-white p-3">
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        list="ciudades-es-filter"
        placeholder="Ciudad: Madrid..."
        className={`${f} w-32`}
      />
      <datalist id="ciudades-es-filter">
        {CIUDADES_ES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <input
        value={barrio}
        onChange={(e) => setBarrio(e.target.value)}
        placeholder="Zona: Malasaña..."
        className={`${f} w-32`}
      />
      <select value={entorno} onChange={(e) => setEntorno(e.target.value)} className={f}>
        <option value="">Entorno</option>
        {ENTORNOS.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
      <select value={habs} onChange={(e) => setHabs(e.target.value)} className={f}>
        <option value="">Habs.</option>
        <option value="1">1+</option>
        <option value="2">2+</option>
        <option value="3">3+</option>
        <option value="4">4+</option>
      </select>
      <select value={baths} onChange={(e) => setBaths(e.target.value)} className={f}>
        <option value="">Baños</option>
        <option value="1">1+</option>
        <option value="2">2+</option>
      </select>
      <input value={min} onChange={(e) => setMin(e.target.value)} type="number" min={0} placeholder="Mín €" className={`${f} w-24`} />
      <input value={max} onChange={(e) => setMax(e.target.value)} type="number" min={0} placeholder="Máx €" className={`${f} w-24`} />
      <input value={m2} onChange={(e) => setM2(e.target.value)} type="number" min={0} placeholder="Mín m²" className={`${f} w-24`} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Palabra: ático, terraza..." className={`${f} min-w-40 flex-1`} />
      <select value={orden} onChange={(e) => setOrden(e.target.value)} className={f}>
        <option value="nuevos">Novedades</option>
        <option value="baratos">Más baratos</option>
        <option value="caros">Más caros</option>
        <option value="grandes">Más grandes</option>
      </select>
      <button className="rounded-full bg-mar-900 px-5 py-1.5 text-sm text-white hover:bg-mar-800">Filtrar</button>
    </form>
  );
}
