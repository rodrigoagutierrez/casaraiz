// Uso: set -a && . ./.env.local && set +a && npm run db:seed:admin
import { db } from "@/shared/db/client";
import { plans, legalDocs } from "@/shared/db/schema";
import { eq } from "drizzle-orm";
import { LEGAL_DOCS } from "@/modules/content/legal-docs-seed";

const PLANS = [
  { plan: "renter_monthly", name: "Inquilino (gratis)", amountCents: 0, currency: "eur", interval: "month", maxListings: 0, active: false, stripePriceId: process.env.STRIPE_PRICE_RENTER_MONTHLY ?? null },
  { plan: "owner_monthly", name: "Dueño mensual", amountCents: 1900, currency: "eur", interval: "month", maxListings: 3, active: true, stripePriceId: process.env.STRIPE_PRICE_OWNER_MONTHLY ?? null },
  { plan: "owner_yearly", name: "Dueño anual", amountCents: 14900, currency: "eur", interval: "year", maxListings: 15, active: true, stripePriceId: process.env.STRIPE_PRICE_OWNER_YEARLY ?? null },
];


async function main() {
  for (const p of PLANS) {
    const existing = await db.select().from(plans).where(eq(plans.plan, p.plan)).limit(1);
    if (existing.length === 0) {
      await db.insert(plans).values({ ...p });
      console.log("plan creado:", p.plan);
    } else {
      await db.update(plans).set({ name: p.name, amountCents: p.amountCents, maxListings: p.maxListings, active: p.active, stripePriceId: p.stripePriceId ?? existing[0].stripePriceId }).where(eq(plans.plan, p.plan));
      console.log("plan existe:", p.plan);
    }
  }
  for (const d of LEGAL_DOCS) {
    const existing = await db.select().from(legalDocs).where(eq(legalDocs.slug, d.slug)).limit(1);
    if (existing.length === 0) {
      await db.insert(legalDocs).values(d);
      console.log("doc creado:", d.slug);
    } else {
      console.log("doc existe:", d.slug);
    }
  }
}

main().catch((e) => {
  console.error("SEED_ADMIN_FAIL:", e);
  process.exit(1);
});
