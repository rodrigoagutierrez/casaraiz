import { db } from "@/shared/db/client";
import { favorites, properties } from "@/shared/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getFavoriteIds(userId: string): Promise<Set<string>> {
  const rows = await db.select({ propertyId: favorites.propertyId }).from(favorites).where(eq(favorites.userId, userId));
  return new Set(rows.map((r) => r.propertyId));
}

export async function getFavoriteProperties(userId: string) {
  return db
    .select({ p: properties })
    .from(favorites)
    .innerJoin(properties, eq(favorites.propertyId, properties.id))
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt))
    .limit(100);
}
