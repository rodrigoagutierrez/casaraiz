import { db } from "@/shared/db/client";
import { feeTiers, plans } from "./schema";
import { subscriptions } from "./schema";
import { properties } from "@/modules/properties/schema";
import { and, asc, eq, gt, isNull, or } from "drizzle-orm";
import type { PlanId } from "./stripe";

// El checkout y /precios usan el price activo en DB (gestionado desde /admin/precios).
export async function getActivePlan(plan: PlanId) {
  const [p] = await db.select().from(plans).where(eq(plans.plan, plan)).limit(1);
  return p;
}

export async function getActivePriceId(plan: PlanId): Promise<string | undefined> {
  return (await getActivePlan(plan))?.stripePriceId ?? undefined;
}

export async function getPublicPlans() {
  return db.select().from(plans).where(eq(plans.active, true));
}

const PUBLISH_PLANS: PlanId[] = ["owner_monthly", "owner_yearly"];

export type Capacity = { hasRights: boolean; limit: number | null; used: number; canPublish: boolean };

// Capacidad de publicación según suscripción: null = ilimitado
export async function getPublishCapacity(userId: string): Promise<Capacity> {
  const now = new Date();
  const subs = await db
    .select({ plan: subscriptions.plan })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active"),
        or(isNull(subscriptions.currentPeriodEnd), gt(subscriptions.currentPeriodEnd, now))
      )
    );
  const owned = subs.filter((s) => (PUBLISH_PLANS as string[]).includes(s.plan));
  if (owned.length === 0) return { hasRights: false, limit: 0, used: 0, canPublish: false };

  const planRows = await db.select().from(plans);
  const tiers = await db.select().from(feeTiers).where(eq(feeTiers.active, true)).orderBy(asc(feeTiers.minProps));
  // El mensual va por tramos: límite = mayor tramo con precio (tramo abierto con precio = ilimitado)
  const pricedTierMaxes = tiers.filter((t) => t.amountCents !== null).map((t) => t.maxProps);
  const monthlyLimit: number | null = pricedTierMaxes.some((m) => m === null)
    ? null
    : Math.max(0, ...pricedTierMaxes.filter((m): m is number => m !== null));

  let limit: number | null = 0;
  for (const s of owned) {
    let l: number | null;
    if (s.plan === "owner_monthly") {
      l = monthlyLimit;
    } else {
      const pl = planRows.find((x) => x.plan === s.plan);
      l = pl?.maxListings ?? 0;
    }
    if (l === null) {
      limit = null;
      break;
    }
    limit = Math.max(limit, l);
  }

  const usedRows = await db
    .select({ id: properties.id })
    .from(properties)
    .where(and(eq(properties.ownerId, userId), eq(properties.status, "active")));
  const used = usedRows.length;
  return { hasRights: true, limit, used, canPublish: limit === null || used < limit };
}
