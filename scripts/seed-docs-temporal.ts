// Uso: set -a && . ./.env.local && set +a && npx tsx scripts/seed-docs-temporal.ts
import { db } from "@/shared/db/client";
import { legalDocs } from "@/shared/db/schema";
import { eq } from "drizzle-orm";
import { LEGAL_DOCS } from "@/modules/content/legal-docs-seed";

async function main() {
  for (const d of LEGAL_DOCS) {
    const existing = await db.select().from(legalDocs).where(eq(legalDocs.slug, d.slug)).limit(1);
    if (existing.length === 0) {
      await db.insert(legalDocs).values(d);
      console.log("creado:", d.slug);
    } else {
      await db.update(legalDocs).set({ title: d.title, content: d.content, updatedAt: new Date() }).where(eq(legalDocs.slug, d.slug));
      console.log("actualizado:", d.slug);
    }
  }
}

main().catch((e) => {
  console.error("FAIL:", e);
  process.exit(1);
});
