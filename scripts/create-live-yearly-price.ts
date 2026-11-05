// Crea SOLO el price anual de dueño en modo live y lo guarda en plans.stripe_price_id.
// NOTA: el checkout ya no usa este price fijo (crea precio inline por tramo: mensual x10).
// Se mantiene por compatibilidad/administración; precio = 2 meses gratis (190 €/año).
// Uso: set -a && . ./.env.local && set +a && npx tsx scripts/create-live-yearly-price.ts
import Stripe from "stripe";
import { neon } from "@neondatabase/serverless";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function main() {
  if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_live") && !process.env.STRIPE_SECRET_KEY?.startsWith("rk_live")) {
    throw new Error("No es clave live (sk_live/rk_live). Abortado.");
  }

  // ¿Existe ya un price anual live activo con nuestro metadata? Reutilizar si existe.
  const existing = await stripe.prices.list({ product: undefined, active: true, limit: 100, expand: ["data.product"] });
  const found = existing.data.find(
    (p) => p.recurring?.interval === "year" && (p.metadata?.plan === "owner_yearly" || (p.product as { name?: string })?.name?.includes("Dueño anual"))
  );
  if (found) {
    console.log("Ya existía price anual live:", found.id);
    await save(found.id);
    return;
  }

  const product = await stripe.products.create({
    name: "CasaRaiz Dueño anual",
    metadata: { plan: "owner_yearly" },
  });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 19000,
    currency: "eur",
    recurring: { interval: "year" },
    tax_behavior: "inclusive",
    metadata: { plan: "owner_yearly" },
  });
  console.log("Price anual live creado:", price.id);
  await save(price.id);
}

async function save(priceId: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const before = await sql`SELECT plan, stripe_price_id FROM plans WHERE plan = 'owner_yearly'`;
  console.log("owner_yearly antes:", JSON.stringify(before));
  const updated = await sql`UPDATE plans SET stripe_price_id = ${priceId}, updated_at = now() WHERE plan = 'owner_yearly' RETURNING plan, stripe_price_id`;
  console.log("owner_yearly después:", JSON.stringify(updated));
}

main().catch((e) => {
  console.error("FAIL:", e.message);
  process.exit(1);
});
