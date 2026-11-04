import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/shared/db/client";
import { users } from "./schema";
import { subscriptions } from "@/modules/billing/schema";
import { and, desc, eq, gt, isNull, or } from "drizzle-orm";

// Lectura pura (sin auto-creación). Usada internamente para evitar recursión.
async function findByClerkId(clerkId: string) {
  const [u] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  return u;
}

// Garantiza que todo usuario autenticado tenga fila en `users`. Evita que un alta
// reciente (sin fila) reciba SIN_PERFIL / redirects en mi-cuenta, favoritos, etc.
export async function getUserByClerkId(clerkId: string) {
  const u = await findByClerkId(clerkId);
  if (u) return u;
  try {
    const client = await clerkClient();
    const cu = await client.users.getUser(clerkId);
    const email = cu.emailAddresses[0]?.emailAddress ?? `${clerkId}@casaraiz.local`;
    return await getOrCreateUser(clerkId, email);
  } catch {
    return undefined;
  }
}

export async function getOrCreateUser(clerkId: string, email: string, role: "owner" | "renter" = "renter") {
  const existing = await findByClerkId(clerkId);
  if (existing) {
    // Promoción renter → owner si la acción lo exige (compra/publicar).
    if (existing.role !== role && role === "owner" && existing.role === "renter") {
      await db.update(users).set({ role }).where(eq(users.clerkId, clerkId));
      existing.role = role;
    }
    return existing;
  }
  try {
    const [created] = await db.insert(users).values({ clerkId, email, role }).returning();
    return created;
  } catch {
    // Carrera entre peticiones paralelas: re-leer.
    const again = await findByClerkId(clerkId);
    if (again) return again;
    throw new Error("No se pudo crear el usuario");
  }
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
