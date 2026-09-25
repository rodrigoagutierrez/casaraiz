import { db } from "@/shared/db/client";
import { bookings } from "@/modules/bookings/schema";
import { contacts } from "@/modules/contacts/schema";
import { conversations, messages } from "@/modules/chat/schema";
import { properties, users } from "@/shared/db/schema";
import { desc, sql } from "drizzle-orm";

async function getGestiones() {
  const [bk, ct, cv] = await Promise.all([
    db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(200),
    db.select().from(contacts).orderBy(desc(contacts.createdAt)).limit(200),
    db
      .select({
        id: conversations.id,
        propertyId: conversations.propertyId,
        renterId: conversations.renterId,
        ownerId: conversations.ownerId,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
        msgs: sql<number>`(select count(*)::int from ${messages} where ${messages.conversationId} = ${conversations.id})`,
      })
      .from(conversations)
      .orderBy(desc(conversations.updatedAt))
      .limit(200),
  ]);

  const propIds = Array.from(new Set([...bk.map((b) => b.propertyId), ...ct.map((c) => c.propertyId), ...cv.map((c) => c.propertyId)]));
  const userIds = Array.from(
    new Set([...bk.flatMap((b) => [b.renterId, b.ownerId]), ...ct.flatMap((c) => [c.renterId, c.ownerId]), ...cv.flatMap((c) => [c.renterId, c.ownerId])])
  );

  const [props, us] = await Promise.all([
    propIds.length ? db.select().from(properties).where(sql`${properties.id} in (${sql.join(propIds.map((id) => sql`${id}`), sql`, `)})`) : [],
    userIds.length ? db.select().from(users).where(sql`${users.id} in (${sql.join(userIds.map((id) => sql`${id}`), sql`, `)})`) : [],
  ]);
  const propById = new Map(props.map((p) => [p.id, p]));
  const userById = new Map(us.map((u) => [u.id, u]));

  return { bk, ct, cv, propById, userById };
}

const STATUS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  declined: "Rechazada",
  canceled: "Cancelada",
};

export default async function AdminGestiones() {
  const { bk, ct, cv, propById, userById } = await getGestiones();

  const badge = "rounded-full px-2 py-0.5 text-xs";

  return (
    <div className="space-y-6">
      <p className="text-sm text-mar-950/65">
        Todas las gestiones entre dueños e inquilinos: reservas, contactos y chats.
      </p>

      {/* Reservas */}
      <section className="rounded-2xl border border-mar-100 bg-white">
        <h2 className="border-b border-mar-100 px-5 py-3 font-semibold text-mar-900">Reservas ({bk.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mar-50 text-left text-mar-950/50">
                <th className="p-3">Piso</th>
                <th className="p-3">Inquilino</th>
                <th className="p-3">Dueño</th>
                <th className="p-3">Fechas</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {bk.map((b) => (
                <tr key={b.id} className="border-b border-mar-50 last:border-0">
                  <td className="p-3 font-medium text-mar-900">{propById.get(b.propertyId)?.title ?? "—"}</td>
                  <td className="p-3">{userById.get(b.renterId)?.email ?? "—"}</td>
                  <td className="p-3">{userById.get(b.ownerId)?.email ?? "—"}</td>
                  <td className="p-3 text-mar-950/65">{b.checkin} → {b.checkout}</td>
                  <td className="p-3"><span className={`${badge} ${b.status === "confirmed" ? "bg-green-100 text-green-800" : b.status === "declined" ? "bg-otono-100 text-otono-700" : "bg-mar-100 text-mar-800"}`}>{STATUS[b.status]}</span></td>
                </tr>
              ))}
              {bk.length === 0 && <tr><td colSpan={5} className="p-4 text-mar-950/50">Sin reservas.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* Contactos */}
      <section className="rounded-2xl border border-mar-100 bg-white">
        <h2 className="border-b border-mar-100 px-5 py-3 font-semibold text-mar-900">Contactos ({ct.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mar-50 text-left text-mar-950/50">
                <th className="p-3">Piso</th>
                <th className="p-3">Inquilino</th>
                <th className="p-3">Dueño</th>
                <th className="p-3">Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {ct.map((c) => (
                <tr key={c.id} className="border-b border-mar-50 last:border-0">
                  <td className="p-3 font-medium text-mar-900">{propById.get(c.propertyId)?.title ?? "—"}</td>
                  <td className="p-3">{userById.get(c.renterId)?.email ?? "—"}</td>
                  <td className="p-3">{userById.get(c.ownerId)?.email ?? "—"}</td>
                  <td className="p-3 text-mar-950/65">{(c.message ?? "").slice(0, 80)}</td>
                </tr>
              ))}
              {ct.length === 0 && <tr><td colSpan={4} className="p-4 text-mar-950/50">Sin contactos.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* Chats */}
      <section className="rounded-2xl border border-mar-100 bg-white">
        <h2 className="border-b border-mar-100 px-5 py-3 font-semibold text-mar-900">Conversaciones ({cv.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mar-50 text-left text-mar-950/50">
                <th className="p-3">Piso</th>
                <th className="p-3">Inquilino</th>
                <th className="p-3">Dueño</th>
                <th className="p-3">Mensajes</th>
                <th className="p-3">Últ. actividad</th>
              </tr>
            </thead>
            <tbody>
              {cv.map((c) => (
                <tr key={c.id} className="border-b border-mar-50 last:border-0">
                  <td className="p-3 font-medium text-mar-900">{propById.get(c.propertyId)?.title ?? "—"}</td>
                  <td className="p-3">{userById.get(c.renterId)?.email ?? "—"}</td>
                  <td className="p-3">{userById.get(c.ownerId)?.email ?? "—"}</td>
                  <td className="p-3">{c.msgs}</td>
                  <td className="p-3 text-mar-950/65">{c.updatedAt ? new Date(c.updatedAt).toLocaleString("es-ES") : "—"}</td>
                </tr>
              ))}
              {cv.length === 0 && <tr><td colSpan={5} className="p-4 text-mar-950/50">Sin conversaciones.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
