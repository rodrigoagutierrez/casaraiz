export type Ciudad = {
  slug: string;
  nombre: string;
  h1: string;
  titulo: string;
  descripcion: string;
  zonas: string[];
  precioRef: string;
};

export const CIUDADES: Ciudad[] = [
  {
    slug: "madrid",
    nombre: "Madrid",
    h1: "Alquiler temporal en Madrid sin comisión",
    titulo: "Alquiler temporal en Madrid | CasaRaiz",
    descripcion: "Pisos y apartamentos de alquiler temporal en Madrid directos con el dueño. Sin comisiones ni tarifas de servicio: contacta, reserva y alquila sin intermediarios.",
    zonas: ["Malasaña", "Chamberí", "Salamanca", "Lavapiés", "La Latina", "Chueca"],
    precioRef: "80-160 €/noche",
  },
  {
    slug: "barcelona",
    nombre: "Barcelona",
    h1: "Alquiler temporal en Barcelona sin comisión",
    titulo: "Alquiler temporal en Barcelona | CasaRaiz",
    descripcion: "Apartamentos de alquiler temporal en Barcelona directos con el dueño. Eixample, Gràcia, El Born y más, sin comisiones de agencia ni de plataforma.",
    zonas: ["Eixample", "Gràcia", "El Born", "El Raval", "Poblenou", "Sarrià"],
    precioRef: "90-180 €/noche",
  },
  {
    slug: "valencia",
    nombre: "Valencia",
    h1: "Alquiler temporal en Valencia sin comisión",
    titulo: "Alquiler temporal en Valencia | CasaRaiz",
    descripcion: "Alquiler temporal en Valencia directo con el dueño. Ruzafa, El Cabanyal, Benimaclet y el centro: sin comisiones ni intermediarios.",
    zonas: ["Ruzafa", "El Cabanyal", "Benimaclet", "El Carmen", "Eixample", "La Malvarrosa"],
    precioRef: "70-140 €/noche",
  },
  {
    slug: "sevilla",
    nombre: "Sevilla",
    h1: "Alquiler temporal en Sevilla sin comisión",
    titulo: "Alquiler temporal en Sevilla | CasaRaiz",
    descripcion: "Alquiler temporal en Sevilla directo con el dueño. Triana, Santa Cruz y el centro histórico sin comisiones ni tarifas de servicio.",
    zonas: ["Triana", "Santa Cruz", "La Macarena", "Nervión", "Los Remedios"],
    precioRef: "70-140 €/noche",
  },
  {
    slug: "malaga",
    nombre: "Málaga",
    h1: "Alquiler temporal en Málaga sin comisión",
    titulo: "Alquiler temporal en Málaga | CasaRaiz",
    descripcion: "Alquiler temporal en Málaga directo con el dueño. Centro, Soho y cerca de la playa, sin comisiones ni intermediarios.",
    zonas: ["Centro", "Soho", "La Malagueta", "Pedregalejo", "Teatinos"],
    precioRef: "70-150 €/noche",
  },
  {
    slug: "bilbao",
    nombre: "Bilbao",
    h1: "Alquiler temporal en Bilbao sin comisión",
    titulo: "Alquiler temporal en Bilbao | CasaRaiz",
    descripcion: "Alquiler temporal en Bilbao directo con el dueño. Casco Viejo, Abando e Indautxu sin comisiones ni tarifas de servicio.",
    zonas: ["Casco Viejo", "Abando", "Indautxu", "Deusto", "Santutxu"],
    precioRef: "65-120 €/noche",
  },
  {
    slug: "zaragoza",
    nombre: "Zaragoza",
    h1: "Alquiler temporal en Zaragoza sin comisión",
    titulo: "Alquiler temporal en Zaragoza | CasaRaiz",
    descripcion: "Alquiler temporal en Zaragoza directo con el dueño. Casco Antiguo y el centro, sin comisiones ni intermediarios.",
    zonas: ["Casco Antiguo", "Centro", "Universidad", "Romareda"],
    precioRef: "55-100 €/noche",
  },
  {
    slug: "granada",
    nombre: "Granada",
    h1: "Alquiler temporal en Granada sin comisión",
    titulo: "Alquiler temporal en Granada | CasaRaiz",
    descripcion: "Alquiler temporal en Granada directo con el dueño. Albaicín, Realejo y el centro, sin comisiones ni tarifas de servicio.",
    zonas: ["Albaicín", "Realejo", "Centro", "Zaidín"],
    precioRef: "55-110 €/noche",
  },
  {
    slug: "alicante",
    nombre: "Alicante",
    h1: "Alquiler temporal en Alicante sin comisión",
    titulo: "Alquiler temporal en Alicante | CasaRaiz",
    descripcion: "Alquiler temporal en Alicante directo con el dueño. Centro y cerca del Postiguet, sin comisiones ni intermediarios.",
    zonas: ["Centro", "Playa del Postiguet", "El Barrio", "San Juan"],
    precioRef: "60-120 €/noche",
  },
  {
    slug: "cordoba",
    nombre: "Córdoba",
    h1: "Alquiler temporal en Córdoba sin comisión",
    titulo: "Alquiler temporal en Córdoba | CasaRaiz",
    descripcion: "Alquiler temporal en Córdoba directo con el dueño. Judería y el centro histórico, sin comisiones ni tarifas de servicio.",
    zonas: ["Judería", "Centro", "Vial Norte", "Poniente"],
    precioRef: "50-100 €/noche",
  },
];

export function getCiudad(slug: string) {
  return CIUDADES.find((c) => c.slug === slug);
}
