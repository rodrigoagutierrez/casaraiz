import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/shared/db/client";
import { properties, users } from "@/shared/db/schema";
import { count, eq } from "drizzle-orm";
import { PLANS, stripe, type PlanId } from "@/modules/billing/stripe";
import type Stripe from "stripe";
import { getOrCreateUser } from "@/modules/users/queries";
import { getActivePriceId } from "@/modules/billing/plans";
import { tierForCount } from "@/modules/billing/fees";
import { logAudit } from "@/modules/audit/log";

// POST /api/checkout { plan } -> { url }
// owner_monthly: precio dinámico por tramos según pisos del dueño.
// owner_yearly: precio fijo del plan.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { plan } = (await req.json()) as { plan: PlanId };
  // Solo planes de dueño (los inquilinos son gratis)
  if (plan !== "owner_monthly" && plan !== "owner_yearly") return NextResponse.json({ error: "PLAN_INVALIDO" }, { status: 400 });

  const client = await clerkClient();
  const cu = await client.users.getUser(userId);
  const email = cu.emailAddresses[0]?.emailAddress ?? `${userId}@casaraiz.local`;

  const user = await getOrCreateUser(userId, email, "owner");

  let lineItem: Stripe.Checkout.SessionCreateParams.LineItem;
  let tierLabel = "";
  if (plan === "owner_monthly") {
    const [{ n }] = await db.select({ n: count() }).from(properties).where(eq(properties.ownerId, user.id));
    const tier = await tierForCount(Math.max(n, 1));
    if (!tier || tier.amountCents === null) {
      return NextResponse.json({ error: "CONTACT_SALES" }, { status: 403 });
    }
    tierLabel = tier.label;
    lineItem = {
      price_data: {
        currency: "eur",
        unit_amount: tier.amountCents,
        recurring: { interval: "month" },
        product_data: { name: `CasaRaiz Dueño mensual — ${tier.label}` },
        tax_behavior: "inclusive",
      },
      quantity: 1,
    };
  } else {
    const price = (await getActivePriceId(plan)) ?? process.env[PLANS[plan].priceEnv];
    if (!price) return NextResponse.json({ error: "PRECIO_NO_CONFIGURADO" }, { status: 503 });
    lineItem = { price, quantity: 1 };
  }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email, metadata: { clerkId: userId } });
    customerId = customer.id;
    await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.id));
  }

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? (host ? `https://${host}` : "http://localhost:3000");
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [lineItem],
    success_url: `${site}/membresia/ok?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/precios`,
    metadata: { userId: user.id, plan, clerkId: userId },
    subscription_data: { metadata: { userId: user.id, plan, clerkId: userId } },
    // Tarjeta + SEPA para recurrente; Bizum solo one-off (no admite recurrente)
    payment_method_types: ["card"],
  });

  await logAudit({
    actorId: user.id,
    targetUserId: user.id,
    action: "checkout.started",
    entity: "subscription",
    meta: { plan, tier: tierLabel || undefined },
  });

  return NextResponse.json({ url: session.url });
}
