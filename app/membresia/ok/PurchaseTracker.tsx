"use client";

import { useEffect } from "react";
import { trackEvent } from "@/shared/lib/analytics";

export default function PurchaseTracker({ value, currency, plan }: { value: number; currency: string; plan: string }) {
  useEffect(() => {
    if (value > 0) {
      trackEvent("purchase", {
        currency,
        value,
        items: [{ item_id: plan, item_name: plan === "owner_yearly" ? "Dueño anual" : "Dueño mensual", price: value }],
      });
    }
  }, [value, currency, plan]);
  return null;
}
