-- Lote "notificaciones + perfil + verificación":
-- 1) Teléfono de emergencia del piso (puede coincidir con el del dueño).
-- 2) Fecha de decisión de reserva: alimenta el badge de reservas pendientes/resueltas.
-- 3) Última visita del usuario a las reservas: las decisiones posteriores pintan el badge.
ALTER TABLE "properties" ADD COLUMN "emergency_phone" text;
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "decided_at" timestamp;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bookings_seen_at" timestamp;
