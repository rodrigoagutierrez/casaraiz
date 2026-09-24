// Prueba end-to-end del sistema de valoraciones con una reserva ficticia.
// Uso: set -a && . ./.env.local && set +a && npx tsx scripts/test-rating.ts
import { db } from "@/shared/db/client";
import { users } from "@/modules/users/schema";
import { properties } from "@/modules/properties/schema";
import { bookings, reviews } from "@/modules/bookings/schema";
import { eq } from "drizzle-orm";
import { getPropertyRating, getUserRating, getPropertyReviews, myPendingReviews, reviewWindow } from "@/modules/bookings/queries";

async function main() {
  // 1. Usuarios de prueba
  let [owner] = await db.select().from(users).where(eq(users.clerkId, "demo-owner-valencia")).limit(1);
  let [renter] = await db.select().from(users).where(eq(users.clerkId, "demo-renter-test")).limit(1);
  if (!renter) {
    [renter] = await db.insert(users).values({ clerkId: "demo-renter-test", role: "renter", email: "renter.test@casaraiz.local" }).returning();
    console.log("✓ Renter de prueba creado:", renter.id);
  }
  if (!owner) throw new Error("Owner demo no existe, ejecuta npm run db:seed");

  // 2. Piso de prueba (usa el seed de Cabanyal)
  const [prop] = await db.select().from(properties).where(eq(properties.slug, "casa-marinera-cabanyal-1")).limit(1);
  if (!prop) throw new Error("Piso seed no encontrado");
  console.log("✓ Piso:", prop.title);

  // 3. Reserva ficticia FINALIZADA (checkout hace 2 días)
  const [booking] = await db.insert(bookings).values({
    propertyId: prop.id,
    renterId: renter.id,
    ownerId: owner.id,
    checkin: "2026-09-15",
    checkout: "2026-09-22",
    guests: 2,
    status: "confirmed",
  }).returning();
  console.log("✓ Reserva creada:", booking.id, "checkout:", booking.checkout);

  const w = reviewWindow(booking.checkout);
  console.log("✓ Ventana de valoración abierta:", w.opened, "· urgente(24h):", w.urgent);

  // 4. Valoración inquilino → dueño (servicio/comunicación/entorno)
  const [rOwner] = await db.insert(reviews).values({
    bookingId: booking.id,
    propertyId: prop.id,
    authorId: renter.id,
    targetUserId: owner.id,
    kind: "to_owner",
    servicio: 5,
    comunicacion: 4,
    entorno: 5,
    comment: "Todo perfecto, mejor que las fotos.",
  }).returning();
  console.log("✓ Review inquilino→dueño creada (5/4/5)");

  // 5. Valoración dueño → inquilino (actitud)
  const [rRenter] = await db.insert(reviews).values({
    bookingId: booking.id,
    propertyId: null,
    authorId: owner.id,
    targetUserId: renter.id,
    kind: "to_renter",
    actitud: 5,
    comment: "Inquilino impecable.",
  }).returning();
  console.log("✓ Review dueño→inquilino creada (actitud 5)");

  // 6. Verificar agregados
  const propRating = await getPropertyRating(prop.id);
  const ownerRating = await getUserRating(owner.id, "to_owner");
  const renterRating = await getUserRating(renter.id, "to_renter");
  const list = await getPropertyReviews(prop.id);

  console.log("\n=== RESULTADOS ===");
  console.log("Piso (media/count):", propRating.avg, "/", propRating.count, "(esperado ~4.67)");
  console.log("Dueño (media/count):", ownerRating.avg, "/", ownerRating.count, "(esperado ~4.67)");
  console.log("Inquilino (media/count):", renterRating.avg, "/", renterRating.count, "(esperado 5)");
  console.log("Reviews visibles en ficha:", list.length, "→", list[0]?.comment);

  const pendientes = await myPendingReviews(renter.id);
  console.log("Pendientes del renter (debería estar vacío tras valorar):", pendientes.length);

  console.log("\n=== LIMPIEZA ===");
  await db.delete(reviews).where(eq(reviews.bookingId, booking.id));
  await db.delete(bookings).where(eq(bookings.id, booking.id));
  console.log("✓ Reserva y reviews de prueba eliminadas");
  console.log("(el renter demo se mantiene para futuras pruebas)");
}

main().catch((e) => {
  console.error("FAIL:", e);
  process.exit(1);
});
