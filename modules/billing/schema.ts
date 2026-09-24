import { pgTable, uuid, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "../users/schema";

export const planEnum = pgEnum("plan", ["renter_monthly", "owner_monthly", "owner_yearly"]);
export const subStatusEnum = pgEnum("sub_status", ["active", "past_due", "canceled", "trialing", "incomplete"]);

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubId: text("stripe_sub_id").unique(),
  plan: planEnum("plan").notNull(),
  status: subStatusEnum("status").notNull().default("incomplete"),
  currentPeriodEnd: timestamp("current_period_end"),
  origin: text("origin").notNull().default("stripe"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const plans = pgTable("plans", {
  plan: text("plan").primaryKey(),
  name: text("name").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("eur"),
  interval: text("interval").notNull().default("month"),
  stripePriceId: text("stripe_price_id"),
  maxListings: integer("max_listings"),
  active: boolean("active").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const feeTiers = pgTable("fee_tiers", {
  id: uuid("id").defaultRandom().primaryKey(),
  minProps: integer("min_props").notNull(),
  maxProps: integer("max_props"),
  amountCents: integer("amount_cents"),
  label: text("label").notNull(),
  active: boolean("active").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
