import { z } from "zod";

export const createPropertySchema = z.object({
  title: z.string().min(10).max(120),
  description: z.string().min(30).max(2000),
  priceEur: z.number().min(200).max(15000),
  rooms: z.number().int().min(0).max(12),
  baths: z.number().int().min(1).max(6).default(1),
  m2: z.number().int().min(15).max(1000),
  address: z.string().max(200).optional(),
  city: z.string().min(2).max(80).default("Valencia"),
  barrio: z.string().min(2).max(60),
  entorno: z.enum(["playa", "montana", "bosque", "ciudad", "rio"]).default("ciudad"),
  lat: z.string().optional(),
  lng: z.string().optional(),
  photos: z.array(z.string().url()).max(12).default([]),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

export function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) +
    "-" +
    Math.random().toString(36).slice(2, 6)
  );
}
