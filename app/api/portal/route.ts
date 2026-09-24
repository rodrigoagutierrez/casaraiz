import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/modules/billing/stripe";
import { getUserByClerkId } from "@/modules/users/queries";

// POST /api/portal -> { url } (Stripe Customer Portal para gestionar/cancelar)
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const user = await getUserByClerkId(userId);
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "SIN_CLIENTE_STRIPE" }, { status: 404 });
  }

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? (host ? `https://${host}` : "http://localhost:3000");
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${site}/precios`,
  });
  return NextResponse.json({ url: session.url });
}
