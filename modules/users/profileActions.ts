"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/shared/db/client";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import { logAudit } from "@/modules/audit/log";
import { revalidatePath } from "next/cache";

export async function updateSuperadminProfile(input: { photoUrl?: string | null; whatsapp?: string | null }) {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHORIZED");

  const client = await clerkClient();
  const cu = await client.users.getUser(userId);
  const role = (cu.publicMetadata as { role?: string })?.role;
  if (role !== "superadmin") throw new Error("NO_SUPERADMIN");

  const [me] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (!me) throw new Error("SIN_PERFIL");

  await db
    .update(users)
    .set({
      ...(input.photoUrl !== undefined ? { photoUrl: input.photoUrl } : {}),
      ...(input.whatsapp !== undefined ? { whatsapp: input.whatsapp } : {}),
    })
    .where(eq(users.id, me.id));

  await logAudit({
    actorId: me.id,
    targetUserId: me.id,
    action: "user.profile_updated",
    entity: "user",
    entityId: me.id,
    meta: { fields: Object.keys(input) },
  });

  revalidatePath("/quienes-somos");
  revalidatePath("/admin/perfil");
  return { ok: true };
}

export async function getSuperadminProfile() {
  const { userId } = await auth();
  if (!userId) return null;

  const client = await clerkClient();
  const cu = await client.users.getUser(userId);
  const role = (cu.publicMetadata as { role?: string })?.role;
  if (role !== "superadmin") return null;

  const [me] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (!me) return null;

  return {
    email: me.email,
    photoUrl: me.photoUrl ?? null,
    whatsapp: me.whatsapp ?? null,
  };
}
