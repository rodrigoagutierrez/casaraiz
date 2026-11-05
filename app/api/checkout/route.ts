import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/shared/db/client";
import { properties, users } from "@/shared/db/schema";
import { count, eq } from "drizzle-orm";
import { stripe, type PlanId } from "@/modules/billing/stripe";
import type Stripe from "stripe";
import { getOrCreateUser } from "@/modules/users/queries";
import { tierForCount } from "@/modules/billing/fees";
import { logAudit } from "@/modules/audit/log";
import { getSiteUrl } from "@/shared/utils/site-url";

// POST /api/checkout { plan } -> { url }
// owner_monthly y owner_yearly: precio inline por tramo según pisos del dueño
// (anual = mensual x10, 2 meses gratis); el tramo comprado se guarda en metadata.
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
  if (plan !== "owner_monthly" && plan !== "owner_yearly") return NextResponse.json({ error: "PLAN_INVALIDO" }, { status: 400 });

  const client = await clerkClient();
  const cu = await client.users.getUser(userId);
  const email = cu.emailAddresses[0]?.emailAddress ?? `${userId}@casaraiz.local`;

  const user = await getOrCreateUser(userId, email, "owner");

  // El tramo se calcula siempre por los pisos del dueño (igual en mensual y anual).
  const [{ n }] = await db.select({ n: count() }).from(properties).where(eq(properties.ownerId, user.id));
  const tier = await tierForCount(Math.max(n, 1));
  if (!tier || tier.amountCents === null) {
    return NextResponse.json({ error: "CONTACT_SALES" }, { status: 403 });
  }
  const tierLabel = tier.label;

  // Anual = mensual x10 (2 meses gratis), mismo alcance por tramo. Precio inline, sin price fijo en Stripe.
  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
    price_data: {
      currency: "eur",
      unit_amount: plan === "owner_yearly" ? tier.amountCents * 10 : tier.amountCents,
      recurring: { interval: plan === "owner_yearly" ? "year" : "month" },
      product_data: {
        name:
          plan === "owner_yearly"
            ? `CasaRaiz Dueño anual — ${tier.label} (2 meses gratis)`
            : `CasaRaiz Dueño mensual — ${tier.label}`,
      },
      tax_behavior: "inclusive",
    },
    quantity: 1,
  };

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
    subscription_data: {
      metadata: {
        userId: user.id,
        plan,
        clerkId: userId,
        tierMax: tier.maxProps === null ? "inf" : String(tier.maxProps),
      },
    },
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
