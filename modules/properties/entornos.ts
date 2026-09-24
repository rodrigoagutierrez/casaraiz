export const ENTORNOS = [
  { value: "playa", label: "Playa" },
  { value: "montana", label: "Montaña" },
  { value: "bosque", label: "Bosque" },
  { value: "ciudad", label: "Ciudad" },
  { value: "rio", label: "Río" },
] as const;

export type Entorno = (typeof ENTORNOS)[number]["value"];

export function entornoLabel(v: string | null | undefined) {
  return ENTORNOS.find((e) => e.value === v)?.label ?? v ?? "—";
}
