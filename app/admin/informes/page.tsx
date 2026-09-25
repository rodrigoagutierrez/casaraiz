import { getPlatformTotals, getSubscriptionReport, getPlatformRevenueByMonth } from "@/modules/reports/queries";
import { eur } from "@/shared/utils/format";

export default async function InformesAdmin() {
  const [totals, subs, revenueByMonth] = await Promise.all([
    getPlatformTotals().catch(() => ({ owners: 0, renters: 0, properties: 0, bookings: 0, activeSubs: 0, seasonalSubs: 0 })),
    getSubscriptionReport().catch(() => []),
    getPlatformRevenueByMonth().catch(() => []),
  ]);

  const active = subs.filter((s) => s.status === "active");
  const byPlan: Record<string, number> = {};
  const byKind: Record<string, number> = {};
  for (const s of active) {
    byPlan[s.plan] = (byPlan[s.plan] ?? 0) + 1;
    byKind[s.kind] = (byKind[s.kind] ?? 0) + 1;
  }

  const card = "rounded-2xl border border-mar-100 bg-white p-5";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-mar-950">Contabilidad y suscripciones</h2>
          <p className="text-sm text-mar-950/55">Vista general de la plataforma.</p>
        </div>
        <a href="/api/reports/subscriptions" className="rounded-full bg-otono-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-otono-700">
          Descargar CSV
        </a>
      </div>

      {/* Totales */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {[
          { label: "Dueños", value: totals.owners },
          { label: "Inquilinos", value: totals.renters },
          { label: "Pisos activos", value: totals.properties },
          { label: "Reservas", value: totals.bookings },
          { label: "Suscripciones activas", value: totals.activeSubs },
          { label: "Ofertas temporada", value: totals.seasonalSubs },
        ].map((c) => (
          <div key={c.label} className={card}>
            <p className="text-xs text-mar-950/55">{c.label}</p>
            <p className="mt-1 text-3xl font-bold text-mar-950">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Suscripciones por plan */}
      <section className={card}>
        <h3 className="font-semibold text-mar-900">Suscripciones activas por plan</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Dueño mensual", key: "owner_monthly" },
            { label: "Dueño anual", key: "owner_yearly" },
            { label: "Inquilino (obsoleto)", key: "renter_monthly" },
          ].map((p) => (
            <div key={p.key} className="rounded-xl bg-mar-50 p-3 text-center">
              <p className="text-2xl font-bold text-mar-900">{byPlan[p.key] ?? 0}</p>
              <p className="text-xs text-mar-950/55">{p.label}</p>
            </div>
          ))}
          <div className="rounded-xl bg-otono-100 p-3 text-center">
            <p className="text-2xl font-bold text-otono-700">{byKind["seasonal"] ?? 0}</p>
            <p className="text-xs text-otono-700/70">Ofertas de temporada</p>
          </div>
        </div>
      </section>

      {/* Ingresos estimados por mes */}
      <section className={card}>
        <h3 className="font-semibold text-mar-900">Volumen de reservas por mes (plataforma)</h3>
        {revenueByMonth.length === 0 ? (
          <p className="mt-2 text-sm text-mar-950/55">Sin reservas confirmadas todavía.</p>
        ) : (
          <div className="mt-3 space-y-1.5">
            {revenueByMonth.map((m) => (
              <div key={m.key} className="flex items-center justify-between rounded-lg bg-mar-50 px-3 py-1.5 text-sm">
                <span className="font-medium text-mar-900">{m.label}</span>
                <span className="text-mar-950/65">{m.bookings} res. · {m.nights} noches · <strong className="text-mar-900">{eur(m.revenue)}</strong></span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tabla de suscripciones */}
      <section className="overflow-hidden rounded-2xl border border-mar-100 bg-white">
        <h3 className="border-b border-mar-100 px-5 py-3 font-semibold text-mar-900">Suscripciones recientes ({subs.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mar-50 text-left text-mar-950/50">
                <th className="p-3">Usuario</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Fin periodo</th>
              </tr>
            </thead>
            <tbody>
              {subs.slice(0, 50).map((s) => (
                <tr key={s.id} className="border-b border-mar-50 last:border-0">
                  <td className="p-3 font-medium text-mar-900">{s.email ?? "—"}</td>
                  <td className="p-3">{s.plan}</td>
                  <td className="p-3">{s.status}</td>
                  <td className="p-3">
                    {s.kind === "seasonal" ? <span className="rounded-full bg-otono-100 px-2 py-0.5 text-xs text-otono-700">Temporada</span> : <span className="rounded-full bg-mar-100 px-2 py-0.5 text-xs text-mar-800">{s.origin}</span>}
                  </td>
                  <td className="p-3 text-mar-950/65">{s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString("es-ES") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
