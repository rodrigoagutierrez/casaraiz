import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/modules/users/queries";
import { getConversation } from "@/modules/chat/queries";
import { db } from "@/shared/db/client";
import { properties, users } from "@/shared/db/schema";
import { eq } from "drizzle-orm";
import ChatThread from "./ChatThread";

export default async function ChatConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const me = await getUserByClerkId(userId);
  if (!me) redirect("/sign-in");

  const { id } = await params;
  const conv = await getConversation(id);
  if (!conv || (conv.renterId !== me.id && conv.ownerId !== me.id)) redirect("/chat");

  const [prop] = await db.select().from(properties).where(eq(properties.id, conv.propertyId)).limit(1);
  const otherId = conv.renterId === me.id ? conv.ownerId : conv.renterId;
  const [other] = await db.select().from(users).where(eq(users.id, otherId)).limit(1);

  return (
    <main className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col px-6 py-4">
      <div className="flex items-center gap-3 border-b border-mar-100 pb-3">
        <Link href="/chat" className="text-sm text-mar-600">←</Link>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-mar-900">{prop?.title ?? "Conversación"}</p>
          <p className="truncate text-xs text-mar-950/55">{other?.email ?? "—"}</p>
        </div>
        {prop && <Link href={`/p/${prop.slug}`} className="text-xs text-mar-700 underline">Ver piso</Link>}
      </div>
      <ChatThread conversationId={conv.id} meId={me.id} />
    </main>
  );
}
