import type { Metadata } from "next";
import Link from "next/link";
import { PlanButton, PortalButton } from "@/modules/billing/components/BillingButtons";
import { getPublicPlans } from "@/modules/billing/plans";
import { getFeeTiers, getTariffSettings } from "@/modules/billing/fees";

export const metadata: Metadata = {
  title: "Planes para dueños · Inquilinos gratis | CasaRaiz",
  description: "Alquiler temporal directo. Inquilinos gratis, dueños con planes por tramos.",
};

function eur(cents: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);
}

export default async function PreciosPage() {
  const [plans, tiers, settings] = await Promise.all([
    getPublicPlans().catch(() => []),
    getFeeTiers().catch(() => []),
    getTariffSettings().catch(() => ({ legend: "", contactLabel: "", contactUrl: "" })),
  ]);
  const yearly = plans.find((p) => p.plan === "owner_yearly");
  const showYearly = yearly ?? { plan: "owner_yearly", name: "Dueño anual", amountCents: 14900, interval: "year" };

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold text-mar-950">Inquilinos gratis. Dueños por tramos.</h1>
      <p className="mt-2 max-w-2xl text-mar-950/65">
        Buscar, filtrar y contactar es gratis para inquilinos. Los dueños pagan según sus pisos publicados,
        sin comisiones por alquiler. Pago recurrente con tarjeta o SEPA (Stripe).
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Mensual por tramos */}
        <div className="rounded-2xl border border-otono-600 bg-white p-6 shadow-lg">
          <span className="rounded-full bg-otono-100 px-3 py-1 text-xs font-medium text-otono-700">Más popular</span>
          <p className="mt-2 font-semibold text-mar-900">Dueño mensual</p>
          <p className="mt-1 text-3xl font-bold text-mar-950">
            desde {tiers.length > 0 && tiers[0].amountCents !== null ? eur(tiers[0].amountCents) : "19 €"}
            <span className="text-base font-normal text-mar-950/55">/mes</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-mar-950/70">
            {tiers.length > 0 ? tiers.map((t) => (
              <li key={t.id}>✓ {t.label}{t.amountCents !== null ? `: ${eur(t.amountCents)}/mes` : ": a consultar"}</li>
            )) : (
              <li>✓ Precio según tus pisos publicados</li>
            )}
            <li>✓ Recibe contactos verificados</li>
            <li>✓ Cancela cuando quieras</li>
          </ul>
          <div className="mt-6">
            <PlanButton plan="owner_monthly">Elegir mensual</PlanButton>
          </div>
        </div>

        {/* Anual fijo */}
        <div className="rounded-2xl border border-mar-100 bg-white p-6">
          <p className="mt-2 font-semibold text-mar-900">{showYearly.name}</p>
          <p className="mt-1 text-3xl font-bold text-mar-950">
            {eur(showYearly.amountCents)}<span className="text-base font-normal text-mar-950/55">/año</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-mar-950/70">
            <li>✓ Hasta 15 pisos</li>
            <li>✓ 2 meses de regalo frente al mensual</li>
            <li>✓ Destacado en tu zona</li>
          </ul>
          <div className="mt-6">
            <PlanButton plan="owner_yearly">Elegir anual</PlanButton>
          </div>
        </div>
      </div>

      {settings.legend && <p className="mt-6 text-center text-sm text-mar-950/60">{settings.legend}</p>}

      {settings.contactUrl && (
        <div className="mt-4 rounded-2xl bg-mar-900 p-6 text-center text-white">
          <p className="font-semibold">{settings.contactLabel || "¿Muchas propiedades?"}</p>
          <a href={settings.contactUrl} className="mt-3 inline-block rounded-full bg-otono-600 px-6 py-2.5 text-sm font-medium hover:bg-otono-700">
            Contactar
          </a>
        </div>
      )}

      <div className="mt-8 text-center">
        <PortalButton />
        <p className="mt-3 text-sm text-mar-950/55">
          ¿Eres inquilino? <Link href="/buscar" className="font-medium text-mar-700 underline">Buscar piso gratis</Link>
        </p>
      </div>
    </main>
  );
}
