import { notFound } from "next/navigation";
import { db } from "@/shared/db/client";
import { legalDocs } from "@/shared/db/schema";
import { eq } from "drizzle-orm";
import { DocEditor } from "@/modules/admin/components/DocEditor";

export default async function AdminDocEdit({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [doc] = await db.select().from(legalDocs).where(eq(legalDocs.slug, slug)).limit(1);
  if (!doc) notFound();

  return (
    <div>
      <p className="text-sm text-mar-950/55">
        Visible en <span className="font-medium">/legal/{doc.slug}</span>. Cambios inmediatos al guardar.
      </p>
      <div className="mt-4"><DocEditor slug={doc.slug} title={doc.title} content={doc.content} /></div>
    </div>
  );
}
