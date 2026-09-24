import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "../users/schema";
import { properties } from "../properties/schema";

export const contacts = pgTable("contacts", {
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
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
