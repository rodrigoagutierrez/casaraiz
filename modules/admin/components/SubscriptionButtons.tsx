"use client";

import { useTransition } from "react";
import { cancelSubscription } from "../actions";

export function CancelButton({ stripeSubId }: { stripeSubId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      className="rounded-full border border-coral-200 px-3 py-1 text-xs text-coral-700 hover:bg-coral-100 disabled:opacity-50"
      disabled={pending}
      onClick={() => {
        if (confirm("¿Cancelar esta suscripción en Stripe?")) start(() => cancelSubscription(stripeSubId));
      }}
    >
      Cancelar
    </button>
  );
}
