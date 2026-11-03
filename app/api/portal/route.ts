import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/modules/billing/stripe";
import { getUserByClerkId } from "@/modules/users/queries";
import { getSiteUrl } from "@/shared/utils/site-url";

// POST /api/portal -> { url } (Stripe Customer Portal para gestionar/cancelar)
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const user = await getUserByClerkId(userId);
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "SIN_CLIENTE_STRIPE" }, { status: 404 });
  }

  const site = getSiteUrl(req);
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${site}/precios`,
  });
  return NextResponse.json({ url: session.url });
}
