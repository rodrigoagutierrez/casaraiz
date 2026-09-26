// Prepara el entorno de pruebas: verifica usuarios Clerk, crea filas DB y otorga plan al dueño.
// Uso: set -a && . ./.env.local && set +a && npx tsx scripts/setup-test-env.ts
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/shared/db/client";
import { users, subscriptions } from "@/shared/db/schema";
import { eq } from "drizzle-orm";

const OWNER_EMAIL = "dueno@casaraizalquiler.com";
const RENTER_EMAIL = "cliente@casaraizalquiler.com";

async function main() {
  const client = await clerkClient();

  for (const email of [OWNER_EMAIL, RENTER_EMAIL]) {
    const found = await client.users.getUserList({ emailAddress: [email] });
    if (found.data.length === 0) throw new Error("No existe en Clerk: " + email);
    const cu = found.data[0];
    const ea = cu.emailAddresses.find((e) => e.emailAddress === email);
    console.log(`✓ Clerk ${email}: verificado=${ea?.verification?.status} password=${!!cu.passwordEnabled} role=${(cu.publicMetadata as { role?: string })?.role}`);

    const [existing] = await db.select().from(users).where(eq(users.clerkId, cu.id)).limit(1);
    if (!existing) {
      const role = email === OWNER_EMAIL ? "owner" : "renter";
      const [created] = await db.insert(users).values({ clerkId: cu.id, email, role }).returning();
      console.log(`✓ Fila DB creada: ${email} (${created.id})`);
    } else {
      console.log(`✓ Fila DB existe: ${email}`);
    }
  }

  // Plan de cortesía al dueño para poder publicar (12 meses)
  const [owner] = await db.select().from(users).where(eq(users.email, OWNER_EMAIL)).limit(1);
  const { hasActiveSubscription } = await import("@/modules/users/queries");
  if (!(await hasActiveSubscription(owner.id))) {
    const end = new Date();
    end.setFullYear(end.getFullYear() + 1);
    await db.insert(subscriptions).values({
      userId: owner.id,
      plan: "owner_monthly",
      status: "active",
      kind: "standard",
      currentPeriodEnd: end,
      origin: "manual",
      adminNote: "Setup de pruebas",
    });
    console.log("✓ Cortesía owner_monthly 12 meses otorgada al dueño");
  } else {
    console.log("✓ El dueño ya tiene suscripción activa");
  }

  const { getPublishCapacity } = await import("@/modules/billing/plans");
  const cap = await getPublishCapacity(owner.id);
  console.log("✓ Capacidad dueño:", JSON.stringify(cap));
}

main().catch((e) => {
  console.error("SETUP FAIL:", e);
  process.exit(1);
});
