import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/shared/db/client";
import { subscriptions } from "@/shared/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/modules/billing/stripe";
import { upsertFromSubscription } from "@/modules/billing/subscription-sync";

// POST /api/webhooks/stripe — configurar en Stripe Dashboard con endpoint /api/webhooks/stripe
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "WEBHOOK_NO_CONFIGURADO" }, { status: 503 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "SIN_FIRMA" }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch {
    return NextResponse.json({ error: "FIRMA_INVALIDA" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await upsertFromSubscription(sub);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await upsertFromSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const subId = (inv as unknown as { subscription?: string }).subscription;
        if (typeof subId === "string") {
          await db
            .update(subscriptions)
            .set({ status: "past_due" })
            .where(eq(subscriptions.stripeSubId, subId));
        }
        break;
      }
    }
  } catch (e) {
    console.error("stripe webhook handler:", e);
    return NextResponse.json({ error: "HANDLER_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
