export type Barrio = {
  slug: string;
  nombre: string;
  h1: string;
  descripcion: string;
  precioRef: string;
};

export const BARRIOS_VALENCIA: Barrio[] = [
  { slug: "ruzafa", nombre: "Ruzafa", h1: "Pisos de alquiler sin inmobiliaria en Ruzafa", descripcion: "El barrio cool de Valencia: gastronomía, nómadas y vida nocturna. Alquila directo con dueños.", precioRef: "1.350-1.600€ 2hab" },
  { slug: "eixample", nombre: "Eixample", h1: "Alquiler dueños directos en Eixample Valencia", descripcion: "Edificios modernistas, céntrico y bien comunicado.", precioRef: "1.500-2.000€" },
  { slug: "el-carmen", nombre: "El Carmen", h1: "Alquiler sin comisión en El Carmen, Ciutat Vella", descripcion: "Casco histórico bohemio, callejuelas y cultura.", precioRef: "1.300-1.500€" },
  { slug: "benimaclet", nombre: "Benimaclet", h1: "Alquiler barato en Benimaclet, ideal estudiantes UPV", descripcion: "Ambiente universitario y de pueblo dentro de la ciudad.", precioRef: "950-1.200€" },
  { slug: "el-cabanyal", nombre: "El Cabanyal", h1: "Pisos alquiler frente al mar en El Cabanyal sin comisión", descripcion: "Barrio marinero en revalorización junto a la playa.", precioRef: "1.200-1.500€" },
  { slug: "la-malvarrosa", nombre: "La Malvarrosa", h1: "Alquiler en La Malvarrosa, dueños directos", descripcion: "Vivir frente al mar sin intermediarios.", precioRef: "1.100-1.350€" },
  { slug: "campanar", nombre: "Campanar", h1: "Alquiler familiar en Campanar sin agencia", descripcion: "Zona residencial tranquila junto al Turia.", precioRef: "1.250-1.450€" },
  { slug: "algiros", nombre: "Algirós", h1: "Alquiler estudiantes en Algirós desde 800€", descripcion: "Junto a universidades, la opción más económica.", precioRef: "800-1.100€" },
  { slug: "pla-del-real", nombre: "Pla del Real", h1: "Alquiler premium en Pla del Real", descripcion: "El barrio más exclusivo de Valencia.", precioRef: "1.600€+" },
  { slug: "extramurs-botanico", nombre: "Botànic", h1: "Pisos en Botànic-Arrancapins sin comisión", descripcion: "Extramurs, céntrico y con encanto.", precioRef: "1.200-1.400€" },
  { slug: "la-saidia", nombre: "La Saïdia", h1: "Alquiler en La Saïdia - Marxalenes", descripcion: "Barrio auténtico bien conectado.", precioRef: "1.050-1.250€" },
  { slug: "patraix", nombre: "Patraix", h1: "Alquiler económico en Patraix", descripcion: "Calidad-precio para familias y jóvenes.", precioRef: "950-1.150€" },
  { slug: "jesus", nombre: "Jesús", h1: "Pisos en Jesús-Patraix, dueños directos", descripcion: "Zona tranquila con metro directo.", precioRef: "950-1.100€" },
  { slug: "quatre-carreres", nombre: "Quatre Carreres", h1: "Alquiler en Monteolivete-En Corts sin comisión", descripcion: "Junto a Ciudad de las Ciencias.", precioRef: "1.000-1.200€" },
  { slug: "poblats-maritims", nombre: "Poblats Marítims", h1: "Alquiler en Poblats Marítims", descripcion: "Vida marinera a 10 min del centro.", precioRef: "1.150-1.400€" },
  { slug: "benicalap", nombre: "Benicalap", h1: "Alquiler en Benicalap", descripcion: "Emergente con buena rentabilidad.", precioRef: "1.050-1.250€" },
  { slug: "l-olivereta", nombre: "L'Olivereta", h1: "Alquiler barato en L'Olivereta", descripcion: "La opción más asequible con metro.", precioRef: "900-1.050€" },
  { slug: "ciutat-vella", nombre: "Ciutat Vella", h1: "Alquiler en Ciutat Vella centro histórico", descripcion: "El corazón de Valencia, dueños directos.", precioRef: "1.400-1.850€" },
  { slug: "camins-al-grau", nombre: "Camins al Grau", h1: "Pisos cerca Ciudad de las Ciencias, Camins al Grau", descripcion: "Ideal profesionales y familias.", precioRef: "1.150-1.350€" },
];

export function getBarrio(slug: string) {
  return BARRIOS_VALENCIA.find((b) => b.slug === slug);
}
