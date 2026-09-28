import { db } from "@/shared/db/client";
import { bookings } from "@/modules/bookings/schema";
import { properties, users } from "@/shared/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { getGuaranteeConfig } from "@/modules/billing/guarantee";
import { GuaranteeSettingsForm } from "@/modules/admin/components/GuaranteeSettingsForm";
import { eur } from "@/shared/utils/format";

export default async function AdminGarantia() {
  const [cfg, rows] = await Promise.all([
    getGuaranteeConfig().catch(() => null),
    db
      .select({
        id: bookings.id,
        checkin: bookings.checkin,
        checkout: bookings.checkout,
        estado: bookings.garantiaEstado,
        importe: bookings.garantiaImporteCents,
        pagadaAt: bookings.garantiaPagadaAt,
        email: users.email,
        title: properties.title,
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.renterId, users.id))
      .leftJoin(properties, eq(bookings.propertyId, properties.id))
      .where(sql`${bookings.garantiaOptada} = true`)
      .orderBy(desc(bookings.createdAt))
      .limit(100)
      .catch(() => []),
  ]);

  const initial: Record<string, string> = {
    garantia_activa: String(cfg?.activa ?? true),
    garantia_nombre: cfg?.nombre ?? "Garantía CasaRaiz",
    garantia_pct: String(cfg?.pct ?? 5),
    garantia_min_cents: String(cfg?.minCents ?? 900),
    garantia_max_cents: cfg?.maxCents != null ? String(cfg.maxCents) : "",
    garantia_texto: cfg?.texto ?? "",
  };

  const total = rows.reduce((a, r) => a + (r.importe ?? 0), 0);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-mar-100 bg-white p-5">
        <h2 className="font-semibold text-mar-900">Configuración (ruta A: aseguradora colaboradora)</h2>
        <p className="mt-1 text-xs text-mar-950/55">
          El canon lo paga el inquilino por Stripe al confirmar. La prima se remite a la aseguradora; el margen es vuestro ingreso.
          La fianza legal (2 meses) sigue siendo obligatoria y aparte.
        </p>
        <div className="mt-3">
          <GuaranteeSettingsForm initial={initial} />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-mar-100 bg-white">
        <h2 className="border-b border-mar-100 px-5 py-3 font-semibold text-mar-900">
          Garantías contratadas ({rows.length}) · total {eur(total)}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mar-50 text-left text-mar-950/50">
                <th className="p-3">Inquilino</th>
                <th className="p-3">Piso</th>
                <th className="p-3">Fechas</th>
                <th className="p-3">Importe</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-mar-50 last:border-0">
                  <td className="p-3 font-medium text-mar-900">{r.email ?? "—"}</td>
                  <td className="p-3">{r.title ?? "—"}</td>
                  <td className="p-3 text-mar-950/65">{r.checkin} → {r.checkout}</td>
                  <td className="p-3">{r.importe ? eur(r.importe) : "—"}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${r.estado === "pagada" ? "bg-green-100 text-green-800" : "bg-otono-100 text-otono-700"}`}>
                      {r.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="p-4 text-sm text-mar-950/55">Aún nadie ha contratado la garantía.</p>}
        </div>
      </section>
    </div>
  );
}
