import { pgTable, uuid, text, timestamp, index, unique } from "drizzle-orm/pg-core";
import { users } from "../users/schema";
import { properties } from "../properties/schema";

// Una conversación por piso + inquilino (el dueño lo determina el piso).
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    renterId: uuid("renter_id")
      .notNull()
      .references(() => users.id),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    unique("uniq_conv_prop_renter").on(t.propertyId, t.renterId),
    index("idx_conv_renter").on(t.renterId),
    index("idx_conv_owner").on(t.ownerId),
  ]
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id),
    // Texto o imagen (data URL comprimida, tamaño limitado). Uno de los dos.
    text: text("text"),
    image: text("image"),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("idx_msg_conv").on(t.conversationId)]
);
