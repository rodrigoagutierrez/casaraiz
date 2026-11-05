// Notificaciones por email (Brevo vía sendEmail). Diseño:
// - `notify(fn)` encola el email con `after()` de Next: se envía tras responder,
//   sin bloquear la request y sin poder romperla.
// - Los emails de destinatario se resuelven aquí (query a `users`) dentro del
//   `after`, para no alargar el camino crítico de las rutas.
// - Si falta BREVO_API_KEY, sendEmail ya hace stub (log en consola).

import { after } from "next/server";
import { db } from "@/shared/db/client";
import { users } from "@/modules/users/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "./email";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://casaraizalquiler.com";

/** Cola un email tras terminar la respuesta (fail-soft: nunca rompe la request). */
export function notify(task: () => Promise<unknown>): void {
  after(() => task().catch((e) => console.error("[notify]", e)));
}

async function emailOf(userId: string): Promise<string | null> {
  try {
    const [u] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
    return u?.email ?? null;
  } catch {
    return null;
  }
}

function fmtDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// ── Reservas ────────────────────────────────────────────────────────────────

export async function notifyBookingRequested(p: {
  ownerId: string;
  renterEmail: string;
  propertyTitle: string;
  checkin: string;
  checkout: string;
  guests: number;
}) {
  const to = await emailOf(p.ownerId);
  if (!to) return;
  await sendEmail(
    to,
    `Nueva solicitud de reserva — ${p.propertyTitle}`,
    `Hola,

${p.renterEmail} ha solicitado reservar «${p.propertyTitle}» del ${fmtDate(p.checkin)} al ${fmtDate(
      p.checkout
    )} (${p.guests} huéspedes).

Confirma o rechaza la solicitud desde tu panel:
${SITE}/duenos

— CasaRaiz`
  );
}

export async function notifyBookingDecided(p: {
  bookingId: string;
  decision: "confirmed" | "declined" | "canceled";
  ownerId: string;
  renterId: string;
  propertyTitle: string;
  checkin: string;
  checkout: string;
}) {
  const dates = `del ${fmtDate(p.checkin)} al ${fmtDate(p.checkout)}`;
  if (p.decision === "canceled") {
    const to = await emailOf(p.ownerId);
    if (!to) return;
    await sendEmail(
      to,
      `Reserva cancelada — ${p.propertyTitle}`,
      `Hola,

El inquilino ha cancelado su reserva de «${p.propertyTitle}» ${dates}.

Tus reservas:
${SITE}/reservas

— CasaRaiz`
    );
    return;
  }
  const to = await emailOf(p.renterId);
  if (!to) return;
  const ok = p.decision === "confirmed";
  await sendEmail(
    to,
    ok ? `Reserva confirmada — ${p.propertyTitle}` : `Reserva no admitida — ${p.propertyTitle}`,
    `Hola,

El dueño de «${p.propertyTitle}» ha ${ok ? "confirmado" : "rechazado"} tu reserva ${dates}.${
      ok
        ? `\n\nPuedes verla aquí:\n${SITE}/reservas`
        : "\n\nPrueba con otras fechas o busca otro piso:\n" + `${SITE}/buscar`
    }

— CasaRaiz`
  );
}

// ── Contacto ────────────────────────────────────────────────────────────────

export async function notifyContactSent(p: { ownerId: string; renterEmail: string; propertyTitle: string; message?: string }) {
  const to = await emailOf(p.ownerId);
  if (!to) return;
  await sendEmail(
    to,
    `Nuevo mensaje sobre ${p.propertyTitle}`,
    `Hola,

${p.renterEmail} te ha escrito desde la ficha de «${p.propertyTitle}»:${
      p.message ? `\n\n«${p.message}»\n` : ""
    }

Respondele a ${p.renterEmail} o sigue el hilo en tu bandeja:
${SITE}/chat

— CasaRaiz`
  );
}

// ── Chat ────────────────────────────────────────────────────────────────────

export async function notifyChatMessage(p: {
  toUserId: string;
  fromEmail: string;
  conversationId: string;
  text?: string;
  hasImage?: boolean;
}) {
  const to = await emailOf(p.toUserId);
  if (!to || to === p.fromEmail) return;
  const preview = p.hasImage ? "[Foto]" : p.text ? `«${p.text.slice(0, 300)}${p.text.length > 300 ? "…" : ""}»` : "";
  await sendEmail(
    to,
    `Nuevo mensaje de ${p.fromEmail}`,
    `Hola,

${p.fromEmail} te ha enviado un mensaje en CasaRaiz:
${preview ? `\n${preview}\n` : ""}

Respón aquí:
${SITE}/chat/${p.conversationId}

— CasaRaiz`
  );
}
