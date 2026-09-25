import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/modules/users/queries";
import { listMyConversations } from "@/modules/chat/queries";

export default async function ChatPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const me = await getUserByClerkId(userId);
  if (!me) redirect("/sign-in");

  const convs = await listMyConversations(me.id).catch(() => []);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold text-mar-950">Mensajes</h1>
      {convs.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-mar-100 bg-white p-8 text-center">
          <p className="font-medium text-mar-900">No tienes conversaciones todavía.</p>
          <p className="mt-1 text-sm text-mar-950/55">
            <Link href="/buscar" className="underline">Busca un piso</Link> y pulsa «Chatear» para hablar con el dueño.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {convs.map((c) => (
            <Link
              key={c.id}
              href={`/chat/${c.id}`}
              className="flex items-center justify-between rounded-2xl border border-mar-100 bg-white p-4 hover:shadow"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-mar-900">{c.title}</p>
                <p className="truncate text-sm text-mar-950/55">{c.lastText ?? "Conversación iniciada"}</p>
                <p className="text-xs text-mar-950/40">con {c.otherEmail}</p>
              </div>
              {c.unread > 0 && (
                <span className="ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-otono-600 text-xs font-bold text-white">
                  {c.unread}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
