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
  const [desde, setDesde] = useState(sp.get("desde") ?? "");
  const [hasta, setHasta] = useState(sp.get("hasta") ?? "");
  const [huespedes, setHuespedes] = useState(sp.get("huespedes") ?? "");

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
    if (desde) p.set("desde", desde);
    if (hasta) p.set("hasta", hasta);
    if (huespedes) p.set("huespedes", huespedes);
    if (orden !== "nuevos") p.set("orden", orden);
    router.push(`/buscar?${p.toString()}`);
  }

  const f = "rounded-full border border-mar-200 bg-white px-3 py-2 text-sm text-mar-950 outline-none focus:border-mar-600 w-full sm:w-auto";

  return (
    <form onSubmit={apply} className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-mar-100 bg-white p-3 sm:flex sm:flex-wrap sm:items-center">
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        list="ciudades-es-filter"
        placeholder="Ciudad: Madrid..."
        className={f}
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
        className={f}
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
      <input value={min} onChange={(e) => setMin(e.target.value)} type="number" min={0} placeholder="Mín €" className={f} />
      <input value={max} onChange={(e) => setMax(e.target.value)} type="number" min={0} placeholder="Máx €" className={f} />
      <input value={m2} onChange={(e) => setM2(e.target.value)} type="number" min={0} placeholder="Mín m²" className={f} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Palabra: ático, terraza..." className={`${f} col-span-2 sm:col-span-1 sm:min-w-40 sm:flex-1`} />
      <input value={desde} onChange={(e) => setDesde(e.target.value)} type="date" title="Check-in" className={f} />
      <input value={hasta} onChange={(e) => setHasta(e.target.value)} type="date" min={desde || undefined} title="Check-out" className={f} />
      <select value={huespedes} onChange={(e) => setHuespedes(e.target.value)} className={f}>
        <option value="">Huéspedes</option>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <option key={n} value={n}>{n}{n === 8 ? "+" : ""}</option>
        ))}
      </select>
      <select value={orden} onChange={(e) => setOrden(e.target.value)} className={f}>
        <option value="nuevos">Novedades</option>
        <option value="baratos">Más baratos</option>
        <option value="caros">Más caros</option>
        <option value="grandes">Más grandes</option>
      </select>
      <button className="col-span-2 rounded-full bg-mar-900 px-5 py-2 text-sm text-white hover:bg-mar-800 sm:col-span-1 sm:py-1.5">Filtrar</button>
    </form>
  );
}
