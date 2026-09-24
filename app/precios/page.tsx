import type { Metadata } from "next";
import { PlanButton, PortalButton } from "@/modules/billing/components/BillingButtons";
import { getPublicPlans } from "@/modules/billing/plans";

export const metadata: Metadata = {
  title: "Membresías sin comisiones | CasaRaiz",
  description: "Dueños e inquilinos directos. Sin comisiones por alquiler.",
};

function eur(cents: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);
}

const FEATURES: Record<string, string[]> = {
  renter_monthly: ["Contacta dueños directos", "Avisos de pisos por barrio", "Sin comisiones ni fianzas extra"],
  owner_monthly: ["Publica pisos ilimitados", "Recibe contactos verificados", "Cancela cuando quieras"],
  owner_yearly: ["Todo lo del mensual", "2 meses de regalo", "Destacado en tu barrio"],
};

export default async function PreciosPage() {
  let rows = await getPublicPlans().catch(() => []);
  if (rows.length === 0) {
    rows = [
      { plan: "renter_monthly", name: "Inquilino", amountCents: 900, currency: "eur", interval: "month", maxListings: 0, stripePriceId: null, active: true, updatedAt: new Date() },
      { plan: "owner_monthly", name: "Dueño mensual", amountCents: 1900, currency: "eur", interval: "month", maxListings: 3, stripePriceId: null, active: true, updatedAt: new Date() },
      { plan: "owner_yearly", name: "Dueño anual", amountCents: 14900, currency: "eur", interval: "year", maxListings: 15, stripePriceId: null, active: true, updatedAt: new Date() },
    ];
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold text-mar-950">Una membresía, cero comisiones</h1>
      <p className="mt-2 text-mar-950/65">
        Pago recurrente con tarjeta o SEPA (Stripe). Bizum disponible solo para pagos únicos.
        IVA incluido, factura española.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {rows.map((c) => {
          const destacado = c.plan === "owner_monthly";
          return (
            <div
              key={c.plan}
              className={`rounded-2xl border bg-white p-6 ${destacado ? "border-otono-600 shadow-lg" : "border-mar-100"}`}
            >
              {destacado && (
                <span className="rounded-full bg-otono-100 px-3 py-1 text-xs font-medium text-otono-700">
                  Más popular
                </span>
              )}
              <p className="mt-2 font-semibold text-mar-900">{c.name}</p>
              <p className="mt-1 text-3xl font-bold text-mar-950">
                {eur(c.amountCents)}<span className="text-base font-normal text-mar-950/55">/{c.interval === "year" ? "año" : "mes"}</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-mar-950/70">
                {(FEATURES[c.plan] ?? []).map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <div className="mt-6">
                <PlanButton plan={c.plan as "renter_monthly" | "owner_monthly" | "owner_yearly"}>Elegir {c.name}</PlanButton>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8 text-center">
        <PortalButton />
      </div>
    </main>
  );
}
