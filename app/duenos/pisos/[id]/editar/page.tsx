import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/shared/db/client";
import { properties } from "@/shared/db/schema";
import { eq } from "drizzle-orm";
import { getUserByClerkId } from "@/modules/users/queries";
import EditForm from "./EditForm";

export default async function EditarPiso({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const me = await getUserByClerkId(userId);
  if (!me) redirect("/sign-in");

  const { id } = await params;
  const [p] = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  if (!p || p.ownerId !== me.id) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/duenos" className="text-sm text-mar-600">← Mis pisos</Link>
      <h1 className="mt-2 text-3xl font-bold text-mar-950">Editar piso</h1>
      <EditForm
        initial={{
          id: p.id,
          title: p.title,
          description: p.description,
          priceCents: p.priceCents,
          rooms: p.rooms,
          baths: p.baths,
          m2: p.m2,
          address: p.address,
          barrio: p.barrio,
          photos: p.photos,
          status: p.status,
        }}
      />
    </main>
  );
}
