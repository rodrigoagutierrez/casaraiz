"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BARRIOS_VALENCIA } from "@/modules/content/barrios";

export default function SearchBar() {
  const router = useRouter();
  const [barrio, setBarrio] = useState("");
  const [habs, setHabs] = useState("");
  const [max, setMax] = useState("");

  function go(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (barrio) q.set("barrio", barrio);
    if (habs) q.set("habs", habs);
    if (max) q.set("max", max);
    router.push(`/buscar?${q.toString()}`);
  }

  const field = "rounded-full border border-mar-200 bg-white px-4 py-2 text-sm text-mar-950 outline-none focus:border-mar-600";

  return (
    <form onSubmit={go} className="mt-8 flex flex-col gap-2 rounded-3xl border border-mar-100 bg-white p-2 shadow-lg sm:flex-row sm:items-center sm:rounded-full">
      <select value={barrio} onChange={(e) => setBarrio(e.target.value)} className={`${field} flex-1 border-0 font-medium`}>
        <option value="">¿Qué barrio?</option>
        {BARRIOS_VALENCIA.map((b) => (
          <option key={b.slug} value={b.slug}>{b.nombre}</option>
        ))}
      </select>
      <select value={habs} onChange={(e) => setHabs(e.target.value)} className={`${field} border-0`}>
        <option value="">Habs.</option>
        <option value="1">1+</option>
        <option value="2">2+</option>
        <option value="3">3+</option>
      </select>
      <select value={max} onChange={(e) => setMax(e.target.value)} className={`${field} border-0`}>
        <option value="">Precio máx.</option>
        <option value="1000">≤ 1.000€</option>
        <option value="1300">≤ 1.300€</option>
        <option value="1600">≤ 1.600€</option>
        <option value="2000">≤ 2.000€</option>
      </select>
      <button type="submit" className="rounded-full bg-coral-500 px-6 py-2.5 font-medium text-white hover:bg-coral-600">
        Buscar
      </button>
    </form>
  );
}
