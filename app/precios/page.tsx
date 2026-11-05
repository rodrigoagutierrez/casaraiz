import type { Metadata } from "next";
import Link from "next/link";
import { PlanButton, PortalButton } from "@/modules/billing/components/BillingButtons";
import { getFeeTiers, getTariffSettings } from "@/modules/billing/fees";

export const metadata: Metadata = {
  title: "Planes para dueños · Inquilinos gratis",
  description:
    "Alquiler temporal directo. Inquilinos gratis, dueños con membresía mensual o anual por tramos según el número de pisos publicados. Sin comisiones por alquiler.",
  alternates: { canonical: "/precios" },
};

function eur(cents: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);
}

export default async function PreciosPage() {
  const [tiers, settings] = await Promise.all([
    getFeeTiers().catch(() => []),
    getTariffSettings().catch(() => ({ legend: "", contactLabel: "", contactUrl: "" })),
  ]);

  // Tramos mensuales activos con precio
  const monthlyTiers = tiers.filter((t) => t.amountCents !== null).sort((a, b) => a.minProps - b.minProps);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold text-mar-950">Inquilinos gratis. Dueños con membresía.</h1>
      <p className="mt-2 max-w-2xl text-mar-950/65">
        Buscar, filtrar y contactar es gratis para inquilinos. Los dueños pagan una membresía mensual o anual, por
        tramos según el número de pisos publicados, sin comisiones por alquiler. <strong className="font-medium text-mar-900">El cobro se hace
        solo al final de cada periodo de membresía</strong>: si no quieres renovar, cancela la suscripción antes de que
        termine. Pago con tarjeta o SEPA (Stripe). Desistimiento de 14 días según TRLGDCU (ver Términos); tras el inicio
        del servicio, acceso hasta fin del periodo pagado.
      </p>

      {/* Mensual por tramos */}
      <h2 className="mt-10 text-xl font-semibold text-mar-900">Mensual</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {monthlyTiers.length > 0 ? (
          monthlyTiers.map((t) => (
            <div key={t.id} className="rounded-2xl border border-otono-600 bg-white p-6 shadow-lg">
              <span className="rounded-full bg-otono-100 px-3 py-1 text-xs font-medium text-otono-700">Mensual</span>
              <p className="mt-2 font-semibold text-mar-900">{t.label}</p>
              <p className="mt-1 text-3xl font-bold text-mar-950">
                {eur(t.amountCents!)}<span className="text-base font-normal text-mar-950/55">/mes</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-mar-950/70">
                <li>✓ Hasta {t.maxProps ?? "∞"} pisos activos</li>
                <li>✓ Sin comisiones por alquiler</li>
                <li>✓ Se cobra al final del periodo</li>
                <li>✓ Cancela cuando quieras</li>
              </ul>
              <div className="mt-6">
                <PlanButton plan="owner_monthly">Elegir mensual</PlanButton>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-otono-600 bg-white p-6 shadow-lg">
            <span className="rounded-full bg-otono-100 px-3 py-1 text-xs font-medium text-otono-700">Mensual</span>
            <p className="mt-2 font-semibold text-mar-900">Hasta 2 pisos</p>
            <p className="mt-1 text-3xl font-bold text-mar-950">
              19 €<span className="text-base font-normal text-mar-950/55">/mes</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-mar-950/70">
              <li>✓ Hasta 2 pisos activos</li>
              <li>✓ Sin comisiones por alquiler</li>
              <li>✓ Se cobra al final del periodo</li>
              <li>✓ Cancela cuando quieras</li>
            </ul>
            <div className="mt-6">
              <PlanButton plan="owner_monthly">Elegir mensual</PlanButton>
            </div>
          </div>
        )}
      </div>

      {/* Anual por tramos: mismo alcance que el mensual, 2 meses gratis */}
      <h2 className="mt-10 text-xl font-semibold text-mar-900">
        Anual <span className="text-base font-normal text-otono-700">· 2 meses gratis</span>
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {monthlyTiers.length > 0 ? (
          monthlyTiers.map((t) => (
            <div key={`anual-${t.id}`} className="rounded-2xl border border-mar-100 bg-white p-6 shadow-lg">
              <span className="rounded-full bg-mar-100 px-3 py-1 text-xs font-medium text-mar-700">Anual</span>
              <p className="mt-2 font-semibold text-mar-900">{t.label}</p>
              <p className="mt-1 text-3xl font-bold text-mar-950">
                {eur(t.amountCents! * 10)}<span className="text-base font-normal text-mar-950/55">/año</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-mar-950/70">
                <li>✓ Hasta {t.maxProps ?? "∞"} pisos activos</li>
                <li>✓ Equivale a 10 meses: 2 gratis</li>
                <li>✓ Sin comisiones por alquiler</li>
                <li>✓ Se cobra al final del periodo</li>
                <li>✓ Cancela cuando quieras</li>
              </ul>
              <div className="mt-6">
                <PlanButton plan="owner_yearly">Elegir anual</PlanButton>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-mar-100 bg-white p-6 shadow-lg">
            <span className="rounded-full bg-mar-100 px-3 py-1 text-xs font-medium text-mar-700">Anual</span>
            <p className="mt-2 font-semibold text-mar-900">Hasta 2 pisos</p>
            <p className="mt-1 text-3xl font-bold text-mar-950">
              190 €<span className="text-base font-normal text-mar-950/55">/año</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-mar-950/70">
              <li>✓ Hasta 2 pisos activos</li>
              <li>✓ Equivale a 10 meses: 2 gratis</li>
              <li>✓ Sin comisiones por alquiler</li>
              <li>✓ Se cobra al final del periodo</li>
              <li>✓ Cancela cuando quieras</li>
            </ul>
            <div className="mt-6">
              <PlanButton plan="owner_yearly">Elegir anual</PlanButton>
            </div>
          </div>
        )}
      </div>

      {tiers.some((t) => t.amountCents === null) && (
        <div className="mt-8 rounded-2xl border border-otono-200 bg-otono-50 p-5">
          <p className="font-semibold text-mar-900">Más de 5 pisos</p>
          <p className="mt-2 text-sm text-mar-950/70">
            Si gestionas más de 5 pisos, contáctanos para un plan a medida.
          </p>
          <a
            href={settings.contactUrl || "mailto:hola@casaraizalquiler.com"}
            className="mt-3 inline-block rounded-full bg-otono-600 px-6 py-2.5 text-sm font-medium hover:bg-otono-700"
          >
            Contactar
          </a>
        </div>
      )}

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
