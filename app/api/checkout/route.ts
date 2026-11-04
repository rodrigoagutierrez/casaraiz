import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/shared/db/client";
import { users } from "@/shared/db/schema";
import { eq } from "drizzle-orm";
import { PLANS, stripe, type PlanId } from "@/modules/billing/stripe";
import type Stripe from "stripe";
import { getOrCreateUser } from "@/modules/users/queries";
import { getActivePriceId } from "@/modules/billing/plans";
import { logAudit } from "@/modules/audit/log";
import { getSiteUrl } from "@/shared/utils/site-url";

// POST /api/checkout { plan } -> { url }
// owner_yearly: precio fijo del plan.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  // Fail-closed: nunca crear suscripciones test en producción (SOC2 CC6.1 / ISO A.5.15).
  if (process.env.VERCEL_ENV === "production" && (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test")) {
    console.error("checkout bloqueado: STRIPE_SECRET_KEY test en producción");
    return NextResponse.json({ error: "PAGO_NO_DISPONIBLE" }, { status: 503 });
  }

  const { plan } = (await req.json()) as { plan: PlanId };
  // Solo planes de dueño (los inquilinos son gratis)
  if (plan !== "owner_yearly") return NextResponse.json({ error: "PLAN_INVALIDO" }, { status: 400 });

  const client = await clerkClient();
  const cu = await client.users.getUser(userId);
  const email = cu.emailAddresses[0]?.emailAddress ?? `${userId}@casaraiz.local`;

  const user = await getOrCreateUser(userId, email, "owner");

  const price = (await getActivePriceId(plan)) ?? process.env[PLANS[plan].priceEnv];
  if (!price) return NextResponse.json({ error: "PRECIO_NO_CONFIGURADO" }, { status: 503 });
  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = { price, quantity: 1 };

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email, metadata: { clerkId: userId } });
    customerId = customer.id;
    await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.id));
  }

  const site = getSiteUrl(req);
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
    meta: { plan },
  });

  return NextResponse.json({ url: session.url });
}
