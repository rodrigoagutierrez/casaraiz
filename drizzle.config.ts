import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: [
    "./modules/users/schema.ts",
    "./modules/properties/schema.ts",
    "./modules/billing/schema.ts",
    "./modules/contacts/schema.ts",
    "./modules/bookings/schema.ts",
    "./modules/content/schema.ts",
    "./modules/audit/schema.ts",
  ],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
