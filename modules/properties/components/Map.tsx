"use client";

export default function Map({ lat, lng, title }: { lat?: string | null; lng?: string | null; title: string }) {
  if (!lat || !lng) {
    return <p className="text-sm text-mar-950/55">Sin ubicación exacta (el dueño la comparte al contactar).</p>;
  }
  const bbox = `${Number(lng) - 0.01}%2C${Number(lat) - 0.01}%2C${Number(lng) + 0.01}%2C${Number(lat) + 0.01}`;
  return (
    <iframe
      title={`Mapa ${title}`}
      loading="lazy"
      className="h-64 w-full rounded-xl border border-mar-100"
      src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`}
    />
  );
}
