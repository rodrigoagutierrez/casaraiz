"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PlanId } from "@/modules/billing/stripe";

export function PlanButton({ plan, children }: { plan: PlanId; children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }
      const json = await res.json();
      if (json.url) window.location.href = json.url as string;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={go}
      disabled={loading}
      className="w-full rounded-full bg-otono-600 py-3 text-white font-medium hover:bg-otono-700 disabled:opacity-50"
    >
      {loading ? "Redirigiendo a Stripe..." : children}
    </button>
  );
}

export function PortalButton() {
  const [loading, setLoading] = useState(false);
  async function go() {
    setLoading(true);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const json = await res.json();
      if (json.url) window.location.href = json.url as string;
    } finally {
      setLoading(false);
    }
  }
  return (
    <button
      onClick={go}
      disabled={loading}
      className="rounded-full border border-mar-200 bg-white px-5 py-2 text-sm text-mar-900 hover:bg-mar-50 disabled:opacity-50"
    >
      {loading ? "Abriendo..." : "Gestionar mi membresía"}
    </button>
  );
}
