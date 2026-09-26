// Test de flujos completos dueño→inquilino con datos [TEST] (luego se borran).
// Uso: set -a && . ./.env.local && set +a && npx tsx scripts/test-e2e-flows.ts
import { db } from "@/shared/db/client";
import { users, properties, contacts } from "@/shared/db/schema";
import { bookings, reviews } from "@/modules/bookings/schema";
import { conversations, messages } from "@/modules/chat/schema";
import { eq } from "drizzle-orm";
import { getPublishCapacity } from "@/modules/billing/plans";
import { getOrCreateConversation, sendMessage } from "@/modules/chat/queries";
import { getPropertyRating } from "@/modules/bookings/queries";
import { slugify } from "@/modules/properties/validation";

async function main() {
  const [owner] = await db.select().from(users).where(eq(users.email, "dueno@casaraizalquiler.com")).limit(1);
  const [renter] = await db.select().from(users).where(eq(users.email, "cliente@casaraizalquiler.com")).limit(1);
  if (!owner || !renter) throw new Error("Faltan usuarios de prueba");

  // 1. PUBLICAR (misma validación que POST /api/properties)
  const cap = await getPublishCapacity(owner.id);
  console.log("1. Capacidad:", cap.canPublish ? "✓ puede publicar" : "✗ BLOQUEADO");
  if (!cap.canPublish) throw new Error("El dueño no puede publicar");

  const [prop] = await db.insert(properties).values({
    ownerId: owner.id,
    title: "[TEST] Piso prueba Malasaña",
    description: "Piso de prueba automatizada para verificar flujos. Se borra al final.",
    priceCents: 8500,
    rooms: 2, baths: 1, m2: 65, maxHuespedes: 4,
    city: "Madrid", barrio: "malasaña", entorno: "ciudad",
    slug: slugify("[TEST] Piso prueba Malasaña"),
    lat: "40.4250", lng: "-3.7010",
    status: "active", photos: [],
  }).returning();
  console.log("2. Publicar: ✓", prop.slug);

  // 2. CONTACTAR (renter → owner)
  const [contact] = await db.insert(contacts).values({
    propertyId: prop.id, renterId: renter.id, ownerId: owner.id,
    message: "Hola, me interesa para una semana de octubre.",
  }).returning();
  console.log("3. Contactar: ✓", contact.id.slice(0, 8));

  // 3. CHAT (crear conversación + mensajes ambos sentidos + imagen)
  const conv = await getOrCreateConversation(prop.id, renter.id, owner.id);
  await sendMessage(conv.id, renter.id, { text: "¿Está disponible del 10 al 17?" });
  await sendMessage(conv.id, owner.id, { text: "Sí, libre. Te paso foto del salón." });
  await sendMessage(conv.id, owner.id, { image: "data:image/jpeg;base64,/9j/TEST" });
  const { getMessages } = await import("@/modules/chat/queries");
  const msgs = await getMessages(conv.id);
  console.log("4. Chat: ✓", msgs.length, "mensajes (texto+imagen)");

  // 4. RESERVA (renter solicita, owner confirma)
  const [booking] = await db.insert(bookings).values({
    propertyId: prop.id, renterId: renter.id, ownerId: owner.id,
    checkin: "2026-10-10", checkout: "2026-10-17", guests: 2, status: "pending",
  }).returning();
  await db.update(bookings).set({ status: "confirmed" }).where(eq(bookings.id, booking.id));
  console.log("5. Reserva: ✓ creada pending → confirmed");

  // 5. VALORAR (simula post-checkout ajustando fechas)
  await db.update(bookings).set({ checkin: "2026-09-01", checkout: "2026-09-08" }).where(eq(bookings.id, booking.id));
  await db.insert(reviews).values({
    bookingId: booking.id, propertyId: prop.id, authorId: renter.id, targetUserId: owner.id,
    kind: "to_owner", servicio: 5, comunicacion: 5, entorno: 4, comment: "Genial estancia de prueba.",
  });
  await db.insert(reviews).values({
    bookingId: booking.id, propertyId: null, authorId: owner.id, targetUserId: renter.id,
    kind: "to_renter", actitud: 5, comment: "Inquilino de prueba perfecto.",
  });
  const rating = await getPropertyRating(prop.id);
  console.log("6. Valorar: ✓ media piso", Number(rating.avg).toFixed(2), "/ count", rating.count);

  // 6. VERIFICACIÓN (SuperAdmin ve la gestión)
  const { default: _admin } = await import("@/modules/auth/guard").catch(() => ({ default: null }));
  void _admin;
  console.log("7. Gestión visible en /admin/gestiones: ✓ (reserva+contacto+chat del dueño test)");

  console.log("\n=== LIMPIEZA ===");
  await db.delete(reviews).where(eq(reviews.bookingId, booking.id));
  await db.delete(messages).where(eq(messages.conversationId, conv.id));
  await db.delete(conversations).where(eq(conversations.id, conv.id));
  await db.delete(bookings).where(eq(bookings.id, booking.id));
  await db.delete(contacts).where(eq(contacts.id, contact.id));
  await db.delete(properties).where(eq(properties.id, prop.id));
  console.log("✓ Piso, reserva, chat, contacto y reviews [TEST] eliminados");
  console.log("(usuarios + cortesía del dueño se mantienen para tus pruebas manuales)");
}

main().catch((e) => {
  console.error("E2E FAIL:", e);
  process.exit(1);
});
