// Geocodificado gratuito vía Nominatim (OpenStreetMap), limitado a España.
// Se usa al publicar para situar el piso en el mapa sin pedir coords al dueño.
export async function geocodeSpain(city: string, barrio?: string): Promise<{ lat: string; lng: string } | null> {
  const q = [barrio, city, "España"].filter(Boolean).join(", ");
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=es&q=${encodeURIComponent(q)}`,
      { headers: { "User-Agent": "CasaRaiz/1.0" }, signal: ctrl.signal }
    );
    clearTimeout(t);
    if (!res.ok) return null;
    const [r] = (await res.json()) as { lat: string; lon: string }[];
    if (!r) return null;
    return { lat: r.lat, lng: r.lon };
  } catch {
    return null;
  }
}

export const CIUDADES_ES = [
  "Valencia",
  "Madrid",
  "Barcelona",
  "Sevilla",
  "Málaga",
  "Bilbao",
  "Zaragoza",
  "Granada",
  "Alicante",
  "Córdoba",
];
