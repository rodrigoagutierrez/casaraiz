import type { MetadataRoute } from "next";
import { db } from "@/shared/db/client";
import { properties } from "@/shared/db/schema";
import { eq } from "drizzle-orm";
import { BARRIOS_VALENCIA } from "@/modules/content/barrios";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://casaraizalquiler.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/buscar`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/mapa`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/precios`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/comparativa`, changeFrequency: "monthly", priority: 0.8 },
  ];

  const barrios: MetadataRoute.Sitemap = BARRIOS_VALENCIA.map((b) => ({
    url: `${base}/alquiler-sin-comision/valencia/${b.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  let propRoutes: MetadataRoute.Sitemap = [];
  try {
    const rows = await db.select({ slug: properties.slug, updatedAt: properties.createdAt }).from(properties).where(eq(properties.status, "active")).limit(5000);
    propRoutes = rows.map((p) => ({
      url: `${base}/p/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    propRoutes = [];
  }

  return [...staticRoutes, ...barrios, ...propRoutes];
}
