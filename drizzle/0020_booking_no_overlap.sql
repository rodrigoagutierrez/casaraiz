-- Reservas sin solape garantizado por el motor de BD.
-- Motivo: el driver neon-http NO admite transacciones interactivas
-- (db.transaction lanza "No transactions support in neon-http driver"),
-- así que el antiguo check-then-insert con FOR UPDATE no era posible y
-- toda creación de reserva fallaba. Este constraint cierra la carrera
-- en el propio Postgres (SOC2 CC8.1): dos inserciones solapadas -> 23P01.
-- btree_gist habilita `uuid WITH =` sobre gist; daterange con '[)' replica
-- la lógica de solape de la API (checkin < checkout ajeno AND checkout > checkin ajeno).
-- OJO: el predicado parcial del EXCLUDE necesita paréntesis propios:
-- `WHERE ("status" IN (…))` sin ellos da "syntax error at or near status".
CREATE EXTENSION IF NOT EXISTS btree_gist;
--> statement-breakpoint
ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_no_overlap"
  EXCLUDE USING gist (
    "property_id" WITH =,
    daterange("checkin", "checkout", '[)') WITH &&
  )
  WHERE ("status" IN ('pending', 'confirmed'));
