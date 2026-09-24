import { db } from "@/shared/db/client";
import { feeTiers } from "@/shared/db/schema";
import { asc } from "drizzle-orm";
import { getTariffSettings } from "@/modules/billing/fees";
import { TierEditor, SettingsEditor } from "@/modules/admin/components/TariffEditor";

export default async function AdminTarifas() {
  const [tiers, settings] = await Promise.all([
    db.select().from(feeTiers).orderBy(asc(feeTiers.minProps)),
    getTariffSettings(),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-mar-100 bg-white p-5">
        <h2 className="font-semibold text-mar-900">Leyenda y contacto (se muestra en /precios)</h2>
        <div className="mt-3"><SettingsEditor {...settings} /></div>
      </section>

      <section>
        <h2 className="font-semibold text-mar-900">Tramos por nº de pisos</h2>
        <p className="mt-1 text-sm text-mar-950/55">
          El mensual cobra según el tramo de los pisos del dueño. Importe vacío = “a consultar” (el checkout pedirá contacto).
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
          {tiers.map((t) => (
            <TierEditor key={t.id} tier={t} />
          ))}
          <TierEditor tier={null} />
        </div>
      </section>
    </div>
  );
}
