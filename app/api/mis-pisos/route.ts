import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/shared/db/client";
import { properties } from "@/shared/db/schema";
import { desc, eq } from "drizzle-orm";
import { getUserByClerkId } from "@/modules/users/queries";
import { getPublishCapacity } from "@/modules/billing/plans";

// GET /api/mis-pisos — pisos del dueño + su capacidad
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const me = await getUserByClerkId(userId);
  if (!me) return NextResponse.json({ data: [], capacity: { hasRights: false, limit: 0, used: 0, canPublish: false } });

  const [rows, capacity] = await Promise.all([
    db.select().from(properties).where(eq(properties.ownerId, me.id)).orderBy(desc(properties.createdAt)).limit(100),
    getPublishCapacity(me.id),
  ]);

  return NextResponse.json({ data: rows, capacity });
}
