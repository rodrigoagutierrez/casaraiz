import { pgTable, uuid, text, smallint, timestamp, date, pgEnum } from "drizzle-orm/pg-core";
import { users } from "../users/schema";
import { properties } from "../properties/schema";

export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "declined", "canceled"]);

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id),
  renterId: uuid("renter_id")
    .notNull()
    .references(() => users.id),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),
  checkin: date("checkin").notNull(),
  checkout: date("checkout").notNull(),
  guests: smallint("guests").notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviewKindEnum = pgEnum("review_kind", ["to_owner", "to_renter"]);

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id),
  propertyId: uuid("property_id").references(() => properties.id),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id),
  targetUserId: uuid("target_user_id")
    .notNull()
    .references(() => users.id),
  kind: reviewKindEnum("kind").notNull(),
  servicio: smallint("servicio"),
  comunicacion: smallint("comunicacion"),
  entorno: smallint("entorno"),
  actitud: smallint("actitud"),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
