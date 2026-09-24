import Link from "next/link";
import { db } from "@/shared/db/client";
import { legalDocs } from "@/shared/db/schema";

export default async function AdminDocs() {
  const rows = await db.select().from(legalDocs);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {rows.map((d) => (
        <Link key={d.slug} href={`/admin/documentos/${d.slug}`} className="rounded-2xl border border-mar-100 bg-white p-5 hover:shadow-lg">
          <p className="font-semibold text-mar-900">{d.title}</p>
          <p className="mt-1 text-xs text-mar-950/55">
            /legal/{d.slug} · act. {new Date(d.updatedAt).toLocaleDateString("es-ES")}
          </p>
          <p className="mt-2 line-clamp-3 text-sm text-mar-950/65">{d.content.slice(0, 140)}...</p>
        </Link>
      ))}
    </div>
  );
}
