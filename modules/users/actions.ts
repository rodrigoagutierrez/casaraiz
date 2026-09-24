"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/shared/db/client";
import { users } from "./schema";
import { logAudit } from "@/modules/audit/log";

// El dueño también puede alquilar: cambia su rol sin perder nada
export async function switchMyRole(role: "owner" | "renter") {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHORIZED");
  const [me] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (!me) throw new Error("SIN_PERFIL");
  await db.update(users).set({ role }).where(eq(users.id, me.id));
  await logAudit({
    actorId: me.id,
    targetUserId: me.id,
    action: "user.role_changed",
    entity: "user",
    entityId: me.id,
    meta: { from: me.role, to: role, bySelf: true },
  });
  revalidatePath("/mi-cuenta");
}

// Subir DNI o pasaporte para verificación (las fotos llegan ya subidas vía /api/upload)
export async function submitVerification(input: { docType: "dni" | "pasaporte"; frontUrl: string; backUrl: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHORIZED");
  const parsed = z
    .object({ docType: z.enum(["dni", "pasaporte"]), frontUrl: z.string().url(), backUrl: z.string().url() })
    .safeParse(input);
  if (!parsed.success) throw new Error("DATOS_INVALIDOS");
  const [me] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (!me) throw new Error("SIN_PERFIL");
  await db
    .update(users)
    .set({
      docType: parsed.data.docType,
      docFrontUrl: parsed.data.frontUrl,
      docBackUrl: parsed.data.backUrl,
      verificationStatus: "pending",
      dniVerified: false,
    })
    .where(eq(users.id, me.id));
  await logAudit({
    actorId: me.id,
    targetUserId: me.id,
    action: "verification.submitted",
    entity: "user",
    entityId: me.id,
    meta: { docType: parsed.data.docType },
  });
  revalidatePath("/mi-cuenta");
}
