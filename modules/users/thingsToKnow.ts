// "Cosas que debes saber" por defecto para un anuncio (editable por el dueño).
export type ThingToKnow = { t: string; d: string };

export const DEFAULT_THINGS_TO_KNOW: ThingToKnow[] = [
  { t: "Sin comisiones", d: "Hablas directo con el dueño. Lo que ves es lo que pagas." },
  { t: "Fianza 2 meses", d: "Contrato de temporada (LAU). El dueño la deposita en su comunidad." },
  { t: "Contacto verificado", d: "Dueño con identidad verificada y valoraciones reales." },
];
