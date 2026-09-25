"use client";

import { useEffect, useRef, useState } from "react";
import { compressImage } from "@/modules/chat/components/compress";

type Msg = {
  id: string;
  senderId: string;
  text: string | null;
  image: string | null;
  createdAt: string;
};

export default function ChatThread({ conversationId, meId }: { conversationId: string; meId: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function refetch() {
    const res = await fetch(`/api/chat/${conversationId}`);
    if (!res.ok) return;
    const json = await res.json();
    setMsgs(json.data.messages ?? []);
  }

  useEffect(() => {
    let active = true;
    async function poll() {
      const res = await fetch(`/api/chat/${conversationId}`);
      if (!res.ok || !active) return;
      const json = await res.json();
      setMsgs(json.data.messages ?? []);
    }
    poll();
    const t = setInterval(poll, 3000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  async function send(text?: string, image?: string) {
    setSending(true);
    try {
      await fetch(`/api/chat/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, image }),
      });
      setText("");
      if (fileRef.current) fileRef.current.value = "";
      await refetch();
    } finally {
      setSending(false);
    }
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const img = await compressImage(file);
      await send(undefined, img);
    } catch {
      alert("No se pudo procesar la imagen.");
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t || sending) return;
    send(t, undefined);
  }

  return (
    <>
      <div className="flex-1 space-y-2 overflow-y-auto py-4">
        {msgs.length === 0 && (
          <p className="pt-10 text-center text-sm text-mar-950/50">
            Empieza la conversación. Envía un mensaje o una foto del piso.
          </p>
        )}
        {msgs.map((m) => {
          const mine = m.senderId === meId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  mine ? "rounded-br-md bg-mar-900 text-white" : "rounded-bl-md bg-white text-mar-900"
                }`}
              >
                {m.text && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                {m.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.image} alt="imagen" className="mt-1 max-h-56 rounded-lg" />
                )}
                <p className={`mt-0.5 text-right text-[10px] ${mine ? "text-white/60" : "text-mar-950/40"}`}>
                  {new Date(m.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-mar-100 pt-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPick}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="Adjuntar imagen"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-mar-200 bg-white text-mar-700 hover:bg-mar-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
            <path d="M16 5l5 5M21 3l-8 8" />
          </svg>
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="h-10 flex-1 rounded-full border border-mar-200 bg-white px-4 text-sm outline-none focus:border-mar-600"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-otono-600 text-white hover:bg-otono-700 disabled:opacity-40"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </>
  );
}
