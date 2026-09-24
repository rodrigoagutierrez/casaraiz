import { db } from "@/shared/db/client";
import { plans } from "@/shared/db/schema";
import { PlanEditor } from "@/modules/admin/components/PlanEditor";

export default async function AdminPrecios() {
  const rows = await db.select().from(plans);

  return (
    <div className="space-y-4">
      <p className="max-w-2xl text-sm text-mar-950/65">
        Al cambiar importe o periodo se crea un <strong>price nuevo en Stripe</strong> y se activa automáticamente
        (los prices son inmutables; las suscripciones existentes conservan el suyo). El checkout siempre usa el price activo de aquí.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {rows.map((p) => (
          <PlanEditor
            key={p.plan}
            plan={p.plan}
            name={p.name}
            amountCents={p.amountCents}
            interval={p.interval}
            stripePriceId={p.stripePriceId}
            maxListings={p.maxListings}
          />
        ))}
      </div>
    </div>
  );
}
