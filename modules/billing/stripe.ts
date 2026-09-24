import Stripe from "stripe";

// Sin clave solo falla al llamar a la API (runtime), nunca en build.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder");

export type PlanId = "renter_monthly" | "owner_monthly" | "owner_yearly";

export const PLANS: Record<PlanId, { nombre: string; precio: string; priceEnv: string }> = {
  renter_monthly: { nombre: "Inquilino mensual", precio: "9€/mes", priceEnv: "STRIPE_PRICE_RENTER_MONTHLY" },
  owner_monthly: { nombre: "Dueño mensual", precio: "19€/mes", priceEnv: "STRIPE_PRICE_OWNER_MONTHLY" },
  owner_yearly: { nombre: "Dueño anual", precio: "149€/año", priceEnv: "STRIPE_PRICE_OWNER_YEARLY" },
};

export function priceIdFor(plan: PlanId): string | undefined {
  return process.env[PLANS[plan].priceEnv];
}

type SubStatus = "active" | "past_due" | "canceled" | "trialing" | "incomplete";

export function mapSubStatus(s: Stripe.Subscription.Status): SubStatus {
  switch (s) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
      return "canceled";
    default:
      return "incomplete";
  }
}
