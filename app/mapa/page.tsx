import type { Metadata } from "next";
import { db } from "@/shared/db/client";
import { properties } from "@/shared/db/schema";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import PropertiesMap from "@/modules/properties/components/PropertiesMap";

export const metadata: Metadata = {
  title: "Mapa de alquileres sin comisión en España | CasaRaiz",
  description: "Explora los pisos de dueños directos sobre el mapa.",
};

export default async function Mapa() {
  let rows: typeof properties.$inferSelect[] = [];
  try {
    rows = await db
      .select()
      .from(properties)
      .where(and(eq(properties.status, "active"), isNotNull(properties.lat), isNotNull(properties.lng)))
      .orderBy(desc(properties.createdAt))
      .limit(200);
  } catch {
    rows = [];
  }

  const pins = rows
    .filter((p) => p.lat && p.lng)
    .map((p) => ({ slug: p.slug, title: p.title, priceCents: p.priceCents, lat: p.lat as string, lng: p.lng as string }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold text-mar-950">Mapa de pisos</h1>
      <p className="mt-1 text-sm text-mar-950/55">{pins.length} pisos de dueños directos en España. Toca un precio para ver la ficha.</p>
      <div className="mt-5">
        <PropertiesMap pins={pins} />
      </div>
    </main>
  );
}
