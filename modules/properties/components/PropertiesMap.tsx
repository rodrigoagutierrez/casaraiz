"use client";

import { useEffect, useRef } from "react";
import { eur } from "@/shared/utils/format";

export type Pin = {
  slug: string;
  title: string;
  priceCents: number;
  lat: string;
  lng: string;
};

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export default function PropertiesMap({ pins }: { pins: Pin[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: { remove: () => void } | null = null;
    let alive = true;
    const list = pins.filter((p) => p.lat && p.lng);
    (async () => {
      const L = (await import("leaflet")).default;
      if (!ref.current || !alive) return;
      map = L.map(ref.current).setView([39.4699, -0.3763], 13);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map as never);
      const bounds: [number, number][] = [];
      for (const p of list) {
        const lat = Number(p.lat);
        const lng = Number(p.lng);
        if (!isFinite(lat) || !isFinite(lng)) continue;
        const icon = L.divIcon({
          className: "",
          html: `<div style="background:#083253;color:#fff;font-weight:700;font-size:12px;padding:4px 10px;border-radius:999px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.25)">${eur(p.priceCents)}</div>`,
          iconSize: [70, 28],
          iconAnchor: [35, 14],
        });
        L.marker([lat, lng], { icon })
          .addTo(map as never)
          .bindPopup(`<a href="/p/${esc(p.slug)}"><strong>${esc(p.title)}</strong><br>${eur(p.priceCents)}/mes</a>`);
        bounds.push([lat, lng]);
      }
      if (bounds.length > 1) (map as unknown as { fitBounds: (b: [number, number][]) => void }).fitBounds(bounds);
      else if (bounds.length === 1) (map as unknown as { setView: (c: [number, number], z: number) => void }).setView(bounds[0], 14);
    })();
    return () => {
      alive = false;
      map?.remove();
    };
  }, [pins]);

  if (pins.length === 0) {
    return <p className="rounded-2xl border border-mar-100 bg-white p-8 text-center text-sm text-mar-950/55">Aún no hay pisos con ubicación.</p>;
  }
  return <div ref={ref} className="z-0 h-[70vh] w-full rounded-2xl border border-mar-100" />;
}
