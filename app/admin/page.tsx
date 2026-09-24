import { db } from "@/shared/db/client";
import { contacts, plans, properties, subscriptions, users } from "@/shared/db/schema";
import { count, eq } from "drizzle-orm";

export default async function AdminHome() {
  const [[u], [o], [r], [p], [s], [c]] = await Promise.all([
    db.select({ n: count() }).from(users),
    db.select({ n: count() }).from(users).where(eq(users.role, "owner")),
    db.select({ n: count() }).from(users).where(eq(users.role, "renter")),
    db.select({ n: count() }).from(properties).where(eq(properties.status, "active")),
    db.select({ n: count() }).from(subscriptions).where(eq(subscriptions.status, "active")),
    db.select({ n: count() }).from(contacts),
  ]);

  const planRows = await db.select().from(plans);
  const activeSubs = await db
    .select({ plan: subscriptions.plan })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"));
  const mrr = activeSubs.reduce((acc, s) => {
    const pl = planRows.find((x) => x.plan === s.plan);
    if (!pl) return acc;
    return acc + (pl.interval === "year" ? pl.amountCents / 12 : pl.amountCents);
  }, 0);

  const cards = [
    { label: "Usuarios", value: u.n, sub: `${o.n} dueños · ${r.n} inquilinos` },
    { label: "Pisos activos", value: p.n, sub: "Valencia" },
    { label: "Membresías activas", value: s.n, sub: `MRR ~${(mrr / 100).toFixed(0)}€/mes` },
    { label: "Contactos", value: c.n, sub: "dueño ↔ inquilino" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border border-mar-100 bg-white p-5">
          <p className="text-sm text-mar-950/55">{c.label}</p>
          <p className="mt-1 text-3xl font-bold text-mar-950">{c.value}</p>
          <p className="mt-1 text-xs text-mar-950/55">{c.sub}</p>
        </div>
      ))}
      <p className="text-xs text-mar-950/50 sm:col-span-2 lg:col-span-4">
        Consejo: para dar acceso admin a otra persona, añade su email a ADMIN_EMAILS o pon role=admin en sus metadatos de Clerk.
      </p>
    </div>
  );
}
