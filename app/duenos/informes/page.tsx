import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/modules/users/queries";
import { getOwnerBookingsReport, summarizeOwner } from "@/modules/reports/queries";
import { eur } from "@/shared/utils/format";

export default async function InformesDueno() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const me = await getUserByClerkId(userId);
  if (!me) redirect("/sign-in");

  const rows = await getOwnerBookingsReport(me.id).catch(() => []);
  const s = summarizeOwner(rows);

  const card = "rounded-2xl border border-mar-100 bg-white p-5";

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-mar-950">Informes</h1>
          <p className="mt-1 text-sm text-mar-950/55">Ocupación y ganancias estimadas de tus pisos.</p>
        </div>
        <a href="/api/reports/owner" className="rounded-full bg-otono-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-otono-700">
          Descargar CSV
        </a>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Reservas", value: String(s.totalBookings), sub: "confirmadas" },
          { label: "Noches vendidas", value: String(s.totalNights), sub: "totales" },
          { label: "Ganancias estimadas", value: eur(s.totalRevenueCents), sub: "sin comisiones" },
          { label: "Precio medio", value: eur(Math.round(s.avgNightCents)), sub: "por noche" },
        ].map((c) => (
          <div key={c.label} className={card}>
            <p className="text-sm text-mar-950/55">{c.label}</p>
            <p className="mt-1 text-3xl font-bold text-mar-950">{c.value}</p>
            <p className="mt-1 text-xs text-mar-950/50">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Temporadas por mes */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-mar-950">Ocupación por mes</h2>
        {s.months.length === 0 ? (
          <p className="mt-3 text-sm text-mar-950/55">Aún no hay reservas confirmadas.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {s.months.map((m) => {
              const maxNights = Math.max(...s.months.map((x) => x.nights), 1);
              return (
                <div key={m.key} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-sm font-medium text-mar-900">{m.label}</span>
                  <div className="h-6 flex-1 overflow-hidden rounded-full bg-mar-100">
                    <div
                      className="flex h-full items-center rounded-full bg-otono-600 px-2 text-xs font-medium text-white"
                      style={{ width: `${Math.max((m.nights / maxNights) * 100, 8)}%` }}
                    >
                      {m.nights} n.
                    </div>
                  </div>
                  <span className="w-28 shrink-0 text-right text-sm text-mar-950/65">{m.bookings} res. · {eur(m.revenue)}</span>
                </div>
              );
            })}
          </div>
        )}
        {s.months.length > 0 && (
          <p className="mt-2 text-xs text-mar-950/50">
            Los meses con más noches son tu temporada alta; los de menos, temporada baja.
          </p>
        )}
      </section>

      {/* Días más ocupados */}
      {s.dow.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-mar-950">Check-ins por día</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {s.dow.map((d) => (
              <span key={d.day} className="rounded-full bg-mar-100 px-3 py-1 text-sm text-mar-900">
                {d.day} · <strong>{d.count}</strong>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Detalle de reservas */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-mar-950">Últimas reservas</h2>
        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-mar-950/55">Sin reservas aún.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-mar-100 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-mar-100 text-left text-mar-950/50">
                  <th className="p-3">Piso</th>
                  <th className="p-3">Check-in</th>
                  <th className="p-3">Check-out</th>
                  <th className="p-3">Noches</th>
                  <th className="p-3">Ganancia est.</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((r) => (
                  <tr key={r.id} className="border-b border-mar-50 last:border-0">
                    <td className="p-3 font-medium text-mar-900">
                      <Link href={`/p/${r.slug}`} className="underline">{r.title}</Link>
                    </td>
                    <td className="p-3">{r.checkin}</td>
                    <td className="p-3">{r.checkout}</td>
                    <td className="p-3">{r.nights}</td>
                    <td className="p-3">{eur(r.revenueCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
