"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function ChatButton({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }
      if (res.status === 400) return; // es tu propio piso
      const json = await res.json();
      if (json.data?.id) router.push(`/chat/${json.data.id}`);
    } finally {
      setBusy(false);
    }
  }

  if (!isSignedIn) {
    return (
      <button
        onClick={() => router.push("/sign-in")}
        className="rounded-full border border-mar-200 bg-white px-5 py-2 text-sm font-medium text-mar-900 hover:bg-mar-50"
      >
        Chatear con el dueño
      </button>
    );
  }

  return (
    <button
      onClick={go}
      disabled={busy}
      className="rounded-full border border-otono-200 bg-otono-100 px-5 py-2 text-sm font-medium text-otono-700 hover:bg-otono-200 disabled:opacity-50"
    >
      {busy ? "Abriendo..." : "💬 Chatear con el dueño"}
    </button>
  );
}
