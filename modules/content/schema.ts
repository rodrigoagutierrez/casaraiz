import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const legalDocs = pgTable("legal_docs", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
