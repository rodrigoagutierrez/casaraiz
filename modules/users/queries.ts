import { db } from "@/shared/db/client";
import { users } from "./schema";
import { subscriptions } from "@/modules/billing/schema";
import { and, desc, eq, gt, isNull, or } from "drizzle-orm";

export async function getUserByClerkId(clerkId: string) {
  const [u] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  return u;
}

export async function getOrCreateUser(clerkId: string, email: string, role: "owner" | "renter" = "renter") {
  const existing = await getUserByClerkId(clerkId);
  if (existing) return existing;
  const [created] = await db.insert(users).values({ clerkId, email, role }).returning();
  return created;
}

export async function hasActiveSubscription(userId: string) {
  const now = new Date();
  const rows = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active"),
        or(isNull(subscriptions.currentPeriodEnd), gt(subscriptions.currentPeriodEnd, now))
      )
    )
    .limit(1);
  return rows.length > 0;
}

export async function latestSubscription(userId: string) {
  const [s] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  return s;
}
