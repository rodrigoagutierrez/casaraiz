"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/shared/db/client";
import { users } from "./schema";
import { logAudit } from "@/modules/audit/log";
import { DEFAULT_THINGS_TO_KNOW, type ThingToKnow } from "./thingsToKnow";

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

export async function updateThingsToKnow(input: ThingToKnow[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHORIZED");
  const [me] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (!me) throw new Error("SIN_PERFIL");
  const cleaned = (input ?? [])
    .map((x) => ({ t: String(x?.t ?? "").trim(), d: String(x?.d ?? "").trim() }))
    .filter((x) => x.t || x.d)
    .slice(0, 6);
  const value = cleaned.length > 0 ? cleaned : DEFAULT_THINGS_TO_KNOW;
  await db.update(users).set({ thingsToKnow: value }).where(eq(users.id, me.id));
  await logAudit({
    actorId: me.id,
    targetUserId: me.id,
    action: "user.things_to_know_updated",
    entity: "user",
    entityId: me.id,
    meta: { count: value.length },
  });
  revalidatePath("/mi-cuenta");
  revalidatePath("/p");
}

// Teléfono de contacto del usuario (obligatorio para dueños al publicar/activar)
export async function updateMyPhone(raw: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHORIZED");
  const phone = raw.trim();
  if (phone && (phone.length < 6 || phone.length > 30 || /[^\d\s+()-]/.test(phone))) {
    throw new Error("TELEFONO_INVALIDO");
  }
  const [me] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (!me) throw new Error("SIN_PERFIL");
  await db.update(users).set({ phone: phone || null }).where(eq(users.id, me.id));
  await logAudit({
    actorId: me.id,
    targetUserId: me.id,
    action: "user.data_updated",
    entity: "user",
    entityId: me.id,
    meta: { fields: ["phone"] },
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
  // "Todos los datos cargados": sin foto de perfil no se admite a revisión
  if (!me.photoUrl) throw new Error("FALTA_FOTO");
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
