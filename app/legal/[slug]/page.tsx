import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/shared/db/client";
import { legalDocs } from "@/shared/db/schema";
import { eq } from "drizzle-orm";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [d] = await db.select().from(legalDocs).where(eq(legalDocs.slug, slug)).limit(1);
  return d ? { title: `${d.title} | CasaRaiz` } : {};
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let doc;
  try {
    [doc] = await db.select().from(legalDocs).where(eq(legalDocs.slug, slug)).limit(1);
  } catch {
    doc = undefined;
  }
  if (!doc) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-mar-950">{doc.title}</h1>
      <p className="mt-1 text-xs text-mar-950/50">
        Actualizado {new Date(doc.updatedAt).toLocaleDateString("es-ES")}
      </p>
      <p className="mt-6 whitespace-pre-line text-mar-950/80">{doc.content}</p>
    </main>
  );
}
