import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { getUserByClerkId } from "@/modules/users/queries";
import { getConversation, getMessages, markConversationRead, sendMessage } from "@/modules/chat/queries";

// Tamaño máximo del mensaje (la imagen llega ya comprimida en cliente como data URL).
const MAX_IMAGE_CHARS = 350_000; // ~260KB en base64

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const me = await getUserByClerkId(userId);
  if (!me) return NextResponse.json({ error: "SIN_PERFIL" }, { status: 404 });

  const { id } = await params;
  const conv = await getConversation(id);
  if (!conv || (conv.renterId !== me.id && conv.ownerId !== me.id)) {
    return NextResponse.json({ error: "NO_AUTORIZADO" }, { status: 403 });
  }

  const msgs = await getMessages(conv.id);
  await markConversationRead(conv.id, me.id);
  return NextResponse.json({ data: { conversation: conv, messages: msgs } });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const me = await getUserByClerkId(userId);
  if (!me) return NextResponse.json({ error: "SIN_PERFIL" }, { status: 404 });

  const { id } = await params;
  const conv = await getConversation(id);
  if (!conv || (conv.renterId !== me.id && conv.ownerId !== me.id)) {
    return NextResponse.json({ error: "NO_AUTORIZADO" }, { status: 403 });
  }

  const parsed = z
    .object({
      text: z.string().max(4000).optional(),
      image: z.string().startsWith("data:image/").max(MAX_IMAGE_CHARS).optional(),
    })
    .refine((d) => d.text || d.image, { message: "Envía texto o imagen" })
    .safeParse(await req.json());

  if (!parsed.success) return NextResponse.json({ error: "DATOS_INVALIDOS" }, { status: 400 });

  const created = await sendMessage(conv.id, me.id, parsed.data);
  return NextResponse.json({ data: created }, { status: 201 });
}
