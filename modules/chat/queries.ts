import { db } from "@/shared/db/client";
import { conversations, messages } from "./schema";
import { properties } from "@/modules/properties/schema";
import { users } from "@/modules/users/schema";
import { and, asc, desc, eq, or, sql } from "drizzle-orm";

export async function getOrCreateConversation(propertyId: string, renterId: string, ownerId: string) {
  const [existing] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.propertyId, propertyId), eq(conversations.renterId, renterId)))
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(conversations)
    .values({ propertyId, renterId, ownerId })
    .returning();
  return created;
}

export async function getConversation(id: string) {
  const [c] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return c;
}

export async function getMessages(conversationId: string) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt))
    .limit(500);
}

export async function listMyConversations(userId: string) {
  const rows = await db
    .select({
      id: conversations.id,
      propertyId: conversations.propertyId,
      renterId: conversations.renterId,
      ownerId: conversations.ownerId,
      updatedAt: conversations.updatedAt,
      title: properties.title,
      slug: properties.slug,
      lastText: sql<string | null>`(
        select ${messages.text} from ${messages}
        where ${messages.conversationId} = ${conversations.id}
        order by ${messages.createdAt} desc limit 1
      )`,
      lastAt: sql<string | null>`(
        select ${messages.createdAt}::text from ${messages}
        where ${messages.conversationId} = ${conversations.id}
        order by ${messages.createdAt} desc limit 1
      )`,
      unread: sql<number>`(
        select count(*)::int from ${messages}
        where ${messages.conversationId} = ${conversations.id}
        and ${messages.senderId} <> ${userId}
        and ${messages.readAt} is null
      )`,
    })
    .from(conversations)
    .leftJoin(properties, eq(conversations.propertyId, properties.id))
    .where(or(eq(conversations.renterId, userId), eq(conversations.ownerId, userId)))
    .orderBy(desc(conversations.updatedAt))
    .limit(100);

  // Nombres de la otra parte
  const ids = Array.from(new Set(rows.flatMap((r) => [r.renterId, r.ownerId]))).filter((id) => id !== userId);
  const usersRows = ids.length ? await db.select().from(users).where(sql`${users.id} in (${sql.join(ids.map((id) => sql`${id}`), sql`, `)})`) : [];
  const userById = new Map(usersRows.map((u) => [u.id, u]));

  return rows.map((r) => {
    const other = r.renterId === userId ? userById.get(r.ownerId) : userById.get(r.renterId);
    return { ...r, otherEmail: other?.email ?? "—" };
  });
}

export async function markConversationRead(conversationId: string, readerId: string) {
  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(and(eq(messages.conversationId, conversationId), sql`${messages.senderId} <> ${readerId}`, sql`${messages.readAt} is null`));
}

export async function sendMessage(conversationId: string, senderId: string, data: { text?: string; image?: string }) {
  const [created] = await db
    .insert(messages)
    .values({
      conversationId,
      senderId,
      text: data.text || null,
      image: data.image || null,
    })
    .returning();
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));
  return created;
}
