import Stripe from "stripe";
import { db } from "@/shared/db/client";
import { subscriptions } from "./schema";
import { eq } from "drizzle-orm";
import { mapSubStatus, subPeriodEnd, type PlanId } from "./stripe";
import { logAudit } from "@/modules/audit/log";

// Idempotente: lo usan el webhook y la página /membresia/ok
export async function upsertFromSubscription(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId as string | undefined;
  const plan = (sub.metadata?.plan ?? "renter_monthly") as PlanId;
  if (!userId) return;
  const periodEnd = subPeriodEnd(sub);
  // Tramo comprado (solo si el checkout lo envió; los planes legados quedan en null)
  const tierMaxRaw = sub.metadata?.tierMax;
  const tierMaxParsed = tierMaxRaw === undefined ? NaN : Number(tierMaxRaw);

  const values = {
    userId,
    stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    stripeSubId: sub.id,
    plan,
    status: mapSubStatus(sub.status),
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    ...(tierMaxRaw !== undefined
      ? { tierMaxProps: tierMaxRaw === "inf" || !Number.isFinite(tierMaxParsed) ? null : tierMaxParsed }
      : {}),
  };

  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubId, sub.id))
    .limit(1);

  if (existing.length > 0) {
    await db.update(subscriptions).set(values).where(eq(subscriptions.stripeSubId, sub.id));
  } else {
    await db.insert(subscriptions).values(values);
  }

  if (values.status === "active") {
    await logAudit({
      targetUserId: userId,
      action: "subscription.activated",
      entity: "subscription",
      entityId: sub.id,
      meta: { plan, origin: "stripe" },
    });
  }
}
