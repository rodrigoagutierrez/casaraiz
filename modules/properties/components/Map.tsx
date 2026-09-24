"use client";

import { useEffect, useRef } from "react";

export default function Map({ lat, lng, title }: { lat?: string | null; lng?: string | null; title: string }) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token || !lat || !lng || !ref.current) return;
    let map: unknown;
    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      mapboxgl.accessToken = token;
      const m = new mapboxgl.Map({
        container: ref.current as HTMLElement,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [Number(lng), Number(lat)],
        zoom: 14,
      });
      new mapboxgl.Marker().setLngLat([Number(lng), Number(lat)]).addTo(m);
      map = m;
    })();
    return () => {
      (map as { remove?: () => void } | undefined)?.remove?.();
    };
  }, [token, lat, lng]);

  if (lat && lng) {
    if (token) return <div ref={ref} className="h-64 w-full rounded-xl" aria-label={`Mapa ${title}`} />;
    // Fallback sin token: OpenStreetMap embed
    const bbox = `${Number(lng) - 0.01}%2C${Number(lat) - 0.01}%2C${Number(lng) + 0.01}%2C${Number(lat) + 0.01}`;
    return (
      <iframe
        title={`Mapa ${title}`}
        className="h-64 w-full rounded-xl border"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`}
      />
    );
  }
  return <p className="text-sm text-zinc-500">Sin ubicación exacta (el dueño la comparte al contactar).</p>;
}
