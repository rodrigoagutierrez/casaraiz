import Link from "next/link";
import { stripe } from "@/modules/billing/stripe";
import { upsertFromSubscription } from "@/modules/billing/subscription-sync";

// GET /membresia/ok?session_id=... — confirma el pago y sincroniza la suscripción
// (idempotente; el webhook hace lo mismo cuando está configurado)
export default async function MembresiaOk({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  let ok = false;
  if (session_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.subscription && session.payment_status === "paid") {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await upsertFromSubscription(sub);
        ok = true;
      } else if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await upsertFromSubscription(sub);
        ok = sub.status === "active" || sub.status === "trialing";
      }
    } catch (e) {
      console.error("membresia/ok:", e);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="text-3xl font-bold text-mar-950">
        {ok ? "¡Membresía activa!" : "Pago recibido"}
      </h1>
      <p className="mt-3 text-mar-950/65">
        {ok
          ? "Ya puedes contactar dueños y publicar sin comisiones."
          : "Estamos confirmando tu pago con Stripe. Si en unos minutos no se activa, escríbenos."}
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/alquiler-sin-comision/valencia/ruzafa" className="rounded-full bg-mar-900 px-6 py-3 text-white font-medium hover:bg-mar-800">
          Ver pisos
        </Link>
        <Link href="/publicar" className="rounded-full border border-mar-200 bg-white px-6 py-3 font-medium text-mar-900 hover:bg-mar-50">
          Publicar
        </Link>
      </div>
    </main>
  );
}
