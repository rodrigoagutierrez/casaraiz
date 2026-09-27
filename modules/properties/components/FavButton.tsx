"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function FavButton({ propertyId, initial = false }: { propertyId: string; initial?: boolean }) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [fav, setFav] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    if (busy) return;
    setBusy(true);
    const next = !fav;
    setFav(next);
    try {
      const res = await fetch("/api/favoritos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setFav(!!json.favorited);
    } catch {
      setFav(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      aria-label={fav ? "Quitar de favoritos" : "Guardar en favoritos"}
      aria-pressed={fav}
      className={`flex h-9 w-9 items-center justify-center rounded-full shadow-md transition ${
        fav ? "bg-otono-600 text-white" : "bg-white/95 text-mar-900 hover:text-otono-600"
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20.5s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 7.5 4.5c0 5.4-7.5 10-7.5 10z" />
      </svg>
    </button>
  );
}

export function useFavorites() {
  const [ids, setIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    fetch("/api/favoritos")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => setIds(new Set(j.data ?? [])))
      .catch(() => {});
  }, []);
  return ids;
}
