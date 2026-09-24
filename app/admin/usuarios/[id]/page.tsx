import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/shared/db/client";
import { auditLogs, contacts, properties, subscriptions, users } from "@/shared/db/schema";
import { desc, eq, or } from "drizzle-orm";
import { stripe } from "@/modules/billing/stripe";
import { UserEditForm, GrantForm, CustomPriceForm, CancelSubButton, VerificationReview } from "@/modules/admin/components/UserForms";

export default async function UserDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [u] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!u) notFound();

  const [subs, props, msgs, logs] = await Promise.all([
    db.select().from(subscriptions).where(eq(subscriptions.userId, id)).orderBy(desc(subscriptions.createdAt)),
    db.select().from(properties).where(eq(properties.ownerId, id)).orderBy(desc(properties.createdAt)).limit(50),
    db
      .select({ id: contacts.id, message: contacts.message, createdAt: contacts.createdAt, propertyId: contacts.propertyId })
      .from(contacts)
      .where(or(eq(contacts.renterId, id), eq(contacts.ownerId, id)))
      .orderBy(desc(contacts.createdAt))
      .limit(50),
    db.select().from(auditLogs).where(eq(auditLogs.targetUserId, id)).orderBy(desc(auditLogs.createdAt)).limit(50),
  ]);

  let cards: { id: string; brand: string; last4: string; exp: string }[] = [];
  let invoices: { id: string; amount: string; date: string; status: string }[] = [];
  if (u.stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
    try {
      const pm = await stripe.paymentMethods.list({ customer: u.stripeCustomerId, type: "card" });
      cards = pm.data.map((m) => ({
        id: m.id,
        brand: m.card?.brand ?? "?",
        last4: m.card?.last4 ?? "••••",
        exp: `${m.card?.exp_month}/${m.card?.exp_year}`,
      }));
      const inv = await stripe.invoices.list({ customer: u.stripeCustomerId, limit: 10 });
      invoices = inv.data.map((v) => ({
        id: v.id,
        amount: `${((v.amount_paid || v.amount_due) / 100).toFixed(0)}€`,
        date: new Date(v.created * 1000).toLocaleDateString("es-ES"),
        status: v.status ?? "?",
      }));
    } catch (e) {
      console.error("stripe admin:", e);
    }
  }

  const card = "rounded-2xl border border-mar-100 bg-white p-5";

  return (
    <div className="space-y-4">
      <Link href="/admin/usuarios" className="text-sm text-mar-600">← Usuarios</Link>

      {/* Datos personales */}
      <section className={card}>
        <h2 className="font-semibold text-mar-900">Datos personales</h2>
        <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-mar-950/50">Email</dt><dd className="font-medium text-mar-900">{u.email} <span className="text-xs text-mar-950/50">(login en Clerk, no editable aquí)</span></dd></div>
          <div><dt className="text-mar-950/50">Teléfono</dt><dd className="font-medium text-mar-900">{u.phone ?? "—"}</dd></div>
          <div><dt className="text-mar-950/50">Rol</dt><dd className="font-medium text-mar-900">{u.role}</dd></div>
          <div><dt className="text-mar-950/50">DNI verificado</dt><dd className="font-medium text-mar-900">{u.dniVerified ? "Sí" : "No"}</dd></div>
          <div><dt className="text-mar-950/50">Clerk ID</dt><dd className="font-mono text-xs text-mar-900">{u.clerkId}</dd></div>
          <div><dt className="text-mar-950/50">Stripe customer</dt><dd className="font-mono text-xs text-mar-900">{u.stripeCustomerId ?? "—"}</dd></div>
          <div><dt className="text-mar-950/50">Alta</dt><dd className="text-mar-900">{new Date(u.createdAt).toLocaleString("es-ES")}</dd></div>
        </dl>
        <div className="mt-4 border-t border-mar-100 pt-4">
          <UserEditForm id={u.id} phone={u.phone ?? ""} role={u.role} dni={u.dniVerified} />
        </div>
      </section>

      {/* Verificación de identidad */}
      <section className={card}>
        <h2 className="font-semibold text-mar-900">Verificación de identidad</h2>
        <VerificationReview userId={u.id} status={u.verificationStatus} docType={u.docType} front={u.docFrontUrl} back={u.docBackUrl} />
      </section>

      {/* Suscripciones */}
      <section className={card}>
        <h2 className="font-semibold text-mar-900">Suscripciones</h2>
        {subs.length === 0 && <p className="mt-2 text-sm text-mar-950/55">Sin suscripciones.</p>}
        <ul className="mt-2 space-y-2 text-sm">
          {subs.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-mar-50 p-3">
              <span className="font-medium text-mar-900">{s.plan}</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs">{s.status}</span>
              <span className="text-xs text-mar-950/55">
                {s.origin === "manual" ? "manual" : "stripe"} · fin {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString("es-ES") : "—"}
              </span>
              {s.adminNote && <span className="text-xs italic text-mar-950/55">“{s.adminNote}”</span>}
              {s.status === "active" && s.stripeSubId && <CancelSubButton stripeSubId={s.stripeSubId} />}
            </li>
          ))}
        </ul>
        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-mar-100 pt-4 lg:grid-cols-2">
          <GrantForm userId={u.id} />
          <CustomPriceForm userId={u.id} />
        </div>
      </section>

      {/* Métodos de pago (sin PAN) */}
      <section className={card}>
        <h2 className="font-semibold text-mar-900">Métodos de pago</h2>
        <p className="text-xs text-mar-950/50">Solo marca + últimos 4 + caducidad. Stripe nunca expone el número completo.</p>
        {cards.length === 0 && <p className="mt-2 text-sm text-mar-950/55">Sin tarjetas guardadas.</p>}
        <ul className="mt-2 space-y-2 text-sm">
          {cards.map((c) => (
            <li key={c.id} className="rounded-xl bg-mar-50 p-3 text-mar-900">
              <span className="font-medium capitalize">{c.brand}</span> •••• {c.last4} · caduca {c.exp}
            </li>
          ))}
        </ul>
        <h3 className="mt-4 font-medium text-mar-900">Últimos pagos</h3>
        {invoices.length === 0 && <p className="mt-1 text-sm text-mar-950/55">Sin facturas.</p>}
        <ul className="mt-2 space-y-1 text-sm text-mar-950/70">
          {invoices.map((v) => (
            <li key={v.id}>{v.date} · {v.amount} · {v.status}</li>
          ))}
        </ul>
      </section>

      {/* Actividad: pisos y contactos */}
      <section className={card}>
        <h2 className="font-semibold text-mar-900">Actividad en la web</h2>
        <div className="mt-2 grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div>
            <p className="font-medium text-mar-900">Pisos publicados ({props.length})</p>
            <ul className="mt-1 space-y-1 text-mar-950/70">
              {props.map((p) => (
                <li key={p.id}><Link href={`/p/${p.slug}`} className="underline">{p.title}</Link> · {p.status}</li>
              ))}
              {props.length === 0 && <li>—</li>}
            </ul>
          </div>
          <div>
            <p className="font-medium text-mar-900">Contactos ({msgs.length})</p>
            <ul className="mt-1 space-y-1 text-mar-950/70">
              {msgs.map((m) => (
                <li key={m.id}>{new Date(m.createdAt).toLocaleDateString("es-ES")} · {(m.message ?? "").slice(0, 60)}</li>
              ))}
              {msgs.length === 0 && <li>—</li>}
            </ul>
          </div>
        </div>
      </section>

      {/* Historial auditoría */}
      <section className={card}>
        <h2 className="font-semibold text-mar-900">Historial de cambios y motivos</h2>
        {logs.length === 0 && <p className="mt-2 text-sm text-mar-950/55">Sin movimientos registrados.</p>}
        <ul className="mt-2 space-y-2 text-sm">
          {logs.map((l) => (
            <li key={l.id} className="rounded-xl bg-mar-50 p-3">
              <p className="font-medium text-mar-900">{l.action} <span className="font-normal text-mar-950/50">· {new Date(l.createdAt).toLocaleString("es-ES")}</span></p>
              {l.reason && <p className="mt-0.5 italic text-mar-950/70">Motivo: {l.reason}</p>}
              {l.meta && <p className="mt-0.5 font-mono text-xs text-mar-950/50">{JSON.stringify(l.meta).slice(0, 200)}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
