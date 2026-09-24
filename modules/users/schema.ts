import { pgTable, uuid, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["owner", "renter"]);
export const verificationEnum = pgEnum("verification_status", ["none", "pending", "verified", "rejected"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  role: roleEnum("role").notNull().default("renter"),
  email: text("email").notNull(),
  phone: text("phone"),
  dniVerified: boolean("dni_verified").notNull().default(false),
  verificationStatus: verificationEnum("verification_status").notNull().default("none"),
  docType: text("doc_type"),
  docFrontUrl: text("doc_front_url"),
  docBackUrl: text("doc_back_url"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
