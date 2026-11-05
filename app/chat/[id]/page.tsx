import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/modules/users/queries";
import { getConversation } from "@/modules/chat/queries";
import { db } from "@/shared/db/client";
import { properties, users } from "@/shared/db/schema";
import { eq } from "drizzle-orm";
import { hasConfirmedBookingBetween } from "@/modules/bookings/visibility";
import ChatThread from "./ChatThread";

import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: false } };
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

  // Reserva concretada = se desbloquean email y foto nítida
  const unlocked = await hasConfirmedBookingBetween(conv.propertyId, conv.renterId, conv.ownerId).catch(() => false);
  const roleLabel = conv.renterId === me.id ? "Dueño del piso" : "Interesado en tu piso";

  return (
    // Altura = viewport - cabecera real (101.8px móvil / 127.4px sm+ con logo
    // w-24/w-32 + py-3): así el documento NO scrollea y la cabecera sticky
    // nunca tapa los mensajes. dvh para móviles con barra dinámica.
    <main className="mx-auto flex h-[calc(100dvh-7rem)] max-w-3xl flex-col px-6 py-4 sm:h-[calc(100dvh-8.5rem)]">
      <div className="flex items-center gap-3 border-b border-mar-100 pb-3">
        <Link href="/chat" className="text-sm text-mar-600">←</Link>
        {other?.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={other.photoUrl}
            alt=""
            className={`h-9 w-9 shrink-0 rounded-full object-cover ${unlocked ? "" : "blur-[6px]"}`}
          />
        ) : (
          <div className="h-9 w-9 shrink-0 rounded-full bg-mar-100" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-mar-900">
            {prop?.title ?? "Conversación"}
            {other?.verificationStatus === "verified" && <span className="ml-1.5 text-xs font-semibold text-green-700">✓</span>}
          </p>
          <p className="truncate text-xs text-mar-950/55">
            {unlocked ? other?.email ?? "—" : roleLabel}
            {!unlocked && <span className="ml-1 text-mar-950/40">· contacto al confirmar la reserva</span>}
          </p>
        </div>
        {prop && <Link href={`/p/${prop.slug}`} className="text-xs text-mar-700 underline">Ver piso</Link>}
      </div>
      <ChatThread key={conv.id} conversationId={conv.id} meId={me.id} />
    </main>
  );
}
