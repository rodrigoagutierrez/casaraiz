"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { feeTiers, legalDocs, plans, siteSettings, subscriptions, users } from "@/shared/db/schema";
import { requireAdmin } from "@/modules/auth/guard";
import { getUserByClerkId } from "@/modules/users/queries";
import { logAudit } from "@/modules/audit/log";
import { stripe } from "@/modules/billing/stripe";

async function adminActor() {
  const admin = await requireAdmin();
  const me = await getUserByClerkId(admin.clerkId);
  return { admin, actorId: me?.id ?? null };
}

export async function setUserRole(userId: string, role: "owner" | "renter", reason?: string) {
  const { actorId } = await adminActor();
  const [before] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  await db.update(users).set({ role }).where(eq(users.id, userId));
  await logAudit({
    actorId,
    targetUserId: userId,
    action: "user.role_changed",
    entity: "user",
    entityId: userId,
    meta: { from: before?.role, to: role },
    reason: reason || "cambio rápido desde listado",
  });
  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${userId}`);
}

export async function setDniVerified(userId: string, value: boolean, reason?: string) {
  const { actorId } = await adminActor();
  await db.update(users).set({ dniVerified: value }).where(eq(users.id, userId));
  await logAudit({
    actorId,
    targetUserId: userId,
    action: "user.dni_changed",
    entity: "user",
    entityId: userId,
    meta: { dniVerified: value },
    reason: reason || "cambio rápido desde listado",
  });
  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${userId}`);
}

// Edición de datos personales: motivo OBLIGATORIO (queda en auditoría)
export async function updateUserData(
  userId: string,
  input: { phone: string; role: "owner" | "renter"; dniVerified: boolean },
  reason: string
) {
  const { actorId } = await adminActor();
  if (!reason.trim()) throw new Error("El motivo es obligatorio");
  const [before] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!before) throw new Error("Usuario inexistente");
  await db
    .update(users)
    .set({ phone: input.phone || null, role: input.role, dniVerified: input.dniVerified })
    .where(eq(users.id, userId));
  await logAudit({
    actorId,
    targetUserId: userId,
    action: "user.data_updated",
    entity: "user",
    entityId: userId,
    meta: {
      before: { phone: before.phone, role: before.role, dniVerified: before.dniVerified },
      after: input,
    },
    reason,
  });
  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${userId}`);
}

export async function cancelSubscription(stripeSubId: string, reason?: string) {
  const { actorId } = await adminActor();
  const [row] = await db.select().from(subscriptions).where(eq(subscriptions.stripeSubId, stripeSubId)).limit(1);
  await stripe.subscriptions.cancel(stripeSubId);
  await db.update(subscriptions).set({ status: "canceled" }).where(eq(subscriptions.stripeSubId, stripeSubId));
  await logAudit({
    actorId,
    targetUserId: row?.userId,
    action: "subscription.canceled",
    entity: "subscription",
    entityId: stripeSubId,
    reason: reason || "cancelada por admin",
  });
  revalidatePath("/admin/suscripciones");
  if (row) revalidatePath(`/admin/usuarios/${row.userId}`);
}

// Cortesía: acceso activo N meses sin pasar por Stripe
export async function grantComplimentary(
  userId: string,
  plan: "renter_monthly" | "owner_monthly" | "owner_yearly",
  months: number,
  reason: string
) {
  const { actorId } = await adminActor();
  if (!reason.trim()) throw new Error("El motivo es obligatorio");
  if (months < 1 || months > 24) throw new Error("Entre 1 y 24 meses");
  const end = new Date();
  end.setMonth(end.getMonth() + months);
  const [created] = await db
    .insert(subscriptions)
    .values({ userId, plan, status: "active", currentPeriodEnd: end, origin: "manual", adminNote: reason })
    .returning();
  await logAudit({
    actorId,
    targetUserId: userId,
    action: "subscription.granted",
    entity: "subscription",
    entityId: created.id,
    meta: { plan, months },
    reason,
  });
  revalidatePath(`/admin/usuarios/${userId}`);
  revalidatePath("/admin/suscripciones");
}

// Suscripción especial: precio propio en Stripe con factura (el usuario la paga por email)
export async function createCustomSubscription(
  userId: string,
  amountEur: number,
  interval: "month" | "year",
  reason: string
): Promise<{ invoiceUrl: string | null }> {
  const { actorId } = await adminActor();
  if (!reason.trim()) throw new Error("El motivo es obligatorio");
  const amountCents = Math.round(amountEur * 100);
  if (amountCents < 100) throw new Error("Importe mínimo 1€");

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error("Usuario inexistente");

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, metadata: { clerkId: user.clerkId } });
    customerId = customer.id;
    await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, userId));
  }

  const product = await stripe.products.create({
    name: `CasaRaiz especial — ${user.email}`,
    metadata: { userId, custom: "true" },
  });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: amountCents,
    currency: "eur",
    recurring: { interval },
    tax_behavior: "inclusive",
    metadata: { userId, custom: "true" },
  });
  const sub = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: price.id }],
    collection_method: "send_invoice",
    days_until_due: 7,
    metadata: { userId, plan: "renter_monthly", custom: "true" },
  });

  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubId, sub.id))
    .limit(1);
  const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end;
  const values = {
    userId,
    stripeCustomerId: customerId,
    stripeSubId: sub.id,
    plan: "renter_monthly" as const,
    status: (sub.status === "active" ? "active" : "incomplete") as "active" | "incomplete",
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    origin: "manual",
    adminNote: `Especial ${amountEur}€/${interval === "year" ? "año" : "mes"}. ${reason}`,
  };
  if (existing.length > 0) {
    await db.update(subscriptions).set(values).where(eq(subscriptions.stripeSubId, sub.id));
  } else {
    await db.insert(subscriptions).values(values);
  }

  const invoice = await stripe.invoices.retrieve(sub.latest_invoice as string);
  await logAudit({
    actorId,
    targetUserId: userId,
    action: "subscription.custom_created",
    entity: "subscription",
    entityId: sub.id,
    meta: { amountEur, interval, priceId: price.id },
    reason,
  });
  revalidatePath(`/admin/usuarios/${userId}`);
  revalidatePath("/admin/suscripciones");
  return { invoiceUrl: invoice.hosted_invoice_url ?? null };
}

export async function savePlan(plan: string, input: { name: string; amountEur: number; interval: "month" | "year"; maxListings: number | null }) {
  const { actorId } = await adminActor();
  const amountCents = Math.round(input.amountEur * 100);
  if (amountCents < 100) throw new Error("Importe mínimo 1€");

  const [current] = await db.select().from(plans).where(eq(plans.plan, plan)).limit(1);
  if (!current) throw new Error("Plan inexistente");

  let stripePriceId = current.stripePriceId;
  if (amountCents !== current.amountCents || input.interval !== current.interval) {
    // Los prices de Stripe son inmutables: se crea uno nuevo y se activa
    const product = await stripe.products.create({ name: `CasaRaiz ${input.name}`, metadata: { plan } });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amountCents,
      currency: current.currency,
      recurring: { interval: input.interval },
      tax_behavior: "inclusive",
      metadata: { plan },
    });
    stripePriceId = price.id;
  }

  await db
    .update(plans)
    .set({ name: input.name, amountCents, interval: input.interval, maxListings: input.maxListings, stripePriceId, updatedAt: new Date() })
    .where(eq(plans.plan, plan));
  await logAudit({
    actorId,
    action: "plan.updated",
    entity: "plan",
    entityId: plan,
    meta: { before: { amountCents: current.amountCents, interval: current.interval, maxListings: current.maxListings }, after: { amountCents, interval: input.interval, maxListings: input.maxListings }, stripePriceId },
  });
  revalidatePath("/admin/precios");
  revalidatePath("/precios");
  return stripePriceId;
}

export async function saveDoc(slug: string, title: string, content: string) {
  const { actorId } = await adminActor();
  await db
    .update(legalDocs)
    .set({ title, content, updatedAt: new Date() })
    .where(eq(legalDocs.slug, slug));
  await logAudit({ actorId, action: "doc.updated", entity: "legal_doc", entityId: slug, meta: { title } });
  revalidatePath("/admin/documentos");
  revalidatePath(`/legal/${slug}`);
}

export async function saveTier(input: { id?: string; minProps: number; maxProps: number | null; amountEur: number | null; label: string }) {
  const { actorId } = await adminActor();
  if (input.minProps < 1) throw new Error("Mínimo 1 propiedad");
  if (input.maxProps !== null && input.maxProps < input.minProps) throw new Error("El máximo debe ser ≥ mínimo");
  const values = {
    minProps: input.minProps,
    maxProps: input.maxProps,
    amountCents: input.amountEur === null ? null : Math.round(input.amountEur * 100),
    label: input.label,
    updatedAt: new Date(),
  };
  if (input.id) {
    await db.update(feeTiers).set(values).where(eq(feeTiers.id, input.id));
  } else {
    await db.insert(feeTiers).values({ ...values, active: true });
  }
  await logAudit({ actorId, action: "tariff.updated", entity: "fee_tier", entityId: input.id ?? "nuevo", meta: { ...values } });
  revalidatePath("/admin/tarifas");
  revalidatePath("/precios");
}

export async function toggleTier(id: string, active: boolean) {
  await requireAdmin();
  await db.update(feeTiers).set({ active }).where(eq(feeTiers.id, id));
  revalidatePath("/admin/tarifas");
  revalidatePath("/precios");
}

export async function deleteTier(id: string) {
  await requireAdmin();
  await db.delete(feeTiers).where(eq(feeTiers.id, id));
  revalidatePath("/admin/tarifas");
  revalidatePath("/precios");
}

export async function saveTariffSettings(input: { legend: string; contactLabel: string; contactUrl: string }) {
  const { actorId } = await adminActor();
  for (const [key, value] of Object.entries({
    tariff_legend: input.legend,
    tariff_contact_label: input.contactLabel,
    tariff_contact_url: input.contactUrl,
  })) {
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
    if (existing.length === 0) await db.insert(siteSettings).values({ key, value });
    else await db.update(siteSettings).set({ value }).where(eq(siteSettings.key, key));
  }
  await logAudit({ actorId, action: "tariff.updated", entity: "site_settings", meta: { ...input } });
  revalidatePath("/admin/tarifas");
  revalidatePath("/precios");
}

export async function decideVerification(userId: string, approved: boolean, reason: string) {
  const { actorId } = await adminActor();
  if (!reason.trim()) throw new Error("El motivo es obligatorio");
  await db
    .update(users)
    .set({ verificationStatus: approved ? "verified" : "rejected", dniVerified: approved })
    .where(eq(users.id, userId));
  await logAudit({
    actorId,
    targetUserId: userId,
    action: "verification.decided",
    entity: "user",
    entityId: userId,
    meta: { approved },
    reason,
  });
  revalidatePath(`/admin/usuarios/${userId}`);
  revalidatePath("/admin/usuarios");
}
