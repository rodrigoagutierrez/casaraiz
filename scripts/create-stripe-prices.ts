// Uso: set -a && . ./.env.local && set +a && npx tsx scripts/create-stripe-prices.ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function main() {
  const defs = [
    { key: "renter_monthly", name: "CasaRaiz Inquilino mensual", amount: 900, interval: "month" as const },
    { key: "owner_monthly", name: "CasaRaiz Dueño mensual", amount: 1900, interval: "month" as const },
    { key: "owner_yearly", name: "CasaRaiz Dueño anual", amount: 14900, interval: "year" as const },
  ];
  const out: Record<string, string> = {};
  for (const d of defs) {
    const product = await stripe.products.create({ name: d.name, metadata: { plan: d.key } });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: d.amount,
      currency: "eur",
      recurring: { interval: d.interval },
      tax_behavior: "inclusive",
      metadata: { plan: d.key },
    });
    out[d.key] = price.id;
    console.log(`${d.key}: ${price.id}`);
  }
  console.log(JSON.stringify(out));
}

main().catch((e) => {
  console.error("STRIPE_FAIL:", e.message);
  process.exit(1);
});
