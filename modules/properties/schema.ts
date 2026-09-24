import { pgTable, uuid, text, integer, smallint, jsonb, timestamp, pgEnum, index } from "drizzle-orm/pg-core";
import { users } from "../users/schema";

export const statusEnum = pgEnum("property_status", ["draft", "active", "rented"]);

// Geom PostGIS (geography(Point,4326)) se gestiona vía SQL; aquí lat/lng + seed.
// Ejecutar en Neon una vez: CREATE EXTENSION IF NOT EXISTS postgis;
export const properties = pgTable(
  "properties",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    priceCents: integer("price_cents").notNull(),
    rooms: smallint("rooms").notNull(),
    baths: smallint("baths").notNull().default(1),
    m2: integer("m2").notNull(),
    address: text("address"),
    city: text("city").notNull().default("Valencia"),
    barrio: text("barrio").notNull(),
    slug: text("slug").notNull().unique(),
    lat: text("lat"),
    lng: text("lng"),
    status: statusEnum("status").notNull().default("draft"),
    photos: jsonb("photos").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("idx_prop_city_barrio_status_price").on(t.city, t.barrio, t.status, t.priceCents),
    index("idx_prop_owner").on(t.ownerId),
    index("idx_prop_slug").on(t.slug),
  ]
);

export const favorites = pgTable("favorites", {
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
