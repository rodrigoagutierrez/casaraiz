"use client";

import { useState } from "react";

export default function PayGarantiaButton({ bookingId }: { bookingId: string }) {
  const [busy, setBusy] = useState(false);

  async function pay() {
    setBusy(true);
    try {
      const res = await fetch("/api/garantia/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const json = await res.json().catch(() => ({}));
      if (json.url) window.location.href = json.url as string;
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={pay}
      disabled={busy}
      className="rounded-full bg-otono-600 px-3 py-1 text-xs font-medium text-white hover:bg-otono-700 disabled:opacity-50"
    >
      {busy ? "Abriendo pago..." : "Pagar garantía"}
    </button>
  );
}
