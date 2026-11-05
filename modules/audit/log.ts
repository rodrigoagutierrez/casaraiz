import { db } from "@/shared/db/client";
import { auditLogs } from "./schema";

export type AuditAction =
  | "user.created"
  | "user.data_updated"
  | "user.role_changed"
  | "user.dni_changed"
  | "user.things_to_know_updated"
  | "user.profile_updated"
  | "property.created"
  | "property.updated"
  | "contact.sent"
  | "chat.started"
  | "checkout.started"
  | "subscription.activated"
  | "subscription.canceled"
  | "subscription.granted"
  | "subscription.manual_created"
  | "subscription.custom_created"
  | "plan.updated"
  | "tariff.updated"
  | "tariff.activated"
  | "tariff.deactivated"
  | "tariff.deleted"
  | "booking.created"
  | "garantia.pagada"
  | "booking.decided"
  | "review.created"
  | "review.reminder_sent"
  | "verification.submitted"
  | "verification.decided"
  | "verification.docs_viewed"
  | "doc.updated";

export async function logAudit(input: {
  actorId?: string | null;
  targetUserId?: string | null;
  action: AuditAction;
  entity?: string;
  entityId?: string;
  meta?: Record<string, unknown>;
  reason?: string;
}) {
  try {
    await db.insert(auditLogs).values({
      actorId: input.actorId ?? null,
      targetUserId: input.targetUserId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      meta: input.meta,
      reason: input.reason,
    });
  } catch (e) {
    console.error("audit fail:", e);
  }
}
