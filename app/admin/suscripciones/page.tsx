import { db } from "@/shared/db/client";
import { subscriptions, users } from "@/shared/db/schema";
import { desc, eq } from "drizzle-orm";
import { CancelButton } from "@/modules/admin/components/SubscriptionButtons";

export default async function AdminSubs() {
  const rows = await db
    .select({
      id: subscriptions.id,
      plan: subscriptions.plan,
      status: subscriptions.status,
      stripeSubId: subscriptions.stripeSubId,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      email: users.email,
    })
    .from(subscriptions)
    .leftJoin(users, eq(subscriptions.userId, users.id))
    .orderBy(desc(subscriptions.createdAt))
    .limit(100);

  return (
    <div className="overflow-x-auto rounded-2xl border border-mar-100 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-mar-100 text-left text-mar-950/55">
            <th className="p-3">Usuario</th>
            <th className="p-3">Plan</th>
            <th className="p-3">Estado</th>
            <th className="p-3">Fin periodo</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id} className="border-b border-mar-50 last:border-0">
              <td className="p-3 font-medium text-mar-900">{s.email ?? "—"}</td>
              <td className="p-3">{s.plan}</td>
              <td className="p-3">
                <span className={`rounded-full px-2 py-0.5 text-xs ${s.status === "active" ? "bg-green-100 text-green-800" : s.status === "past_due" ? "bg-otono-100 text-otono-700" : "bg-mar-100 text-mar-800"}`}>
                  {s.status}
                </span>
              </td>
              <td className="p-3 text-mar-950/65">
                {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString("es-ES") : "—"}
              </td>
              <td className="p-3">
                {s.status === "active" && s.stripeSubId && <CancelButton stripeSubId={s.stripeSubId} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="p-4 text-sm text-mar-950/55">Sin suscripciones todavía.</p>}
    </div>
  );
}
