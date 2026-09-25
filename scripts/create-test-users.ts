// Crea usuarios de prueba en Clerk y marca al SuperAdmin.
// Uso: set -a && . ./.env.local && set +a && npx tsx scripts/create-test-users.ts
import { clerkClient } from "@clerk/nextjs/server";

const SUPERADMIN_EMAIL = "rgutierrez2090@gmail.com";
const PASSWORD = "CasaRaiz2026Segura!";

const TEST_USERS = [
  { email: "dueno@casaraizalquiler.com", first: "Dueño", last: "Prueba", role: "owner" },
  { email: "cliente@casaraizalquiler.com", first: "Cliente", last: "Prueba", role: "renter" },
];

async function main() {
  const client = await clerkClient();

  // 1. SuperAdmin
  const existing = await client.users.getUserList({ emailAddress: [SUPERADMIN_EMAIL] });
  if (existing.data.length > 0) {
    const su = existing.data[0];
    await client.users.updateUserMetadata(su.id, { publicMetadata: { role: "superadmin" } });
    console.log("✓ SuperAdmin:", su.emailAddresses[0]?.emailAddress, "(role=superadmin)");
  } else {
    console.log("✗ No se encontró", SUPERADMIN_EMAIL, "- regístrate primero en la web");
  }

  // 2. Usuarios de prueba
  for (const u of TEST_USERS) {
    const found = await client.users.getUserList({ emailAddress: [u.email] });
    if (found.data.length > 0) {
      const id = found.data[0].id;
      await client.users.updateUserMetadata(id, { publicMetadata: { role: u.role } });
      await client.users.updateUser(id, { password: PASSWORD });
      const ea = found.data[0].emailAddresses.find((e) => e.emailAddress === u.email);
      if (ea && ea.verification?.status !== "verified") {
        await client.emailAddresses.updateEmailAddress(ea.id, { verified: true });
      }
      console.log("✓ Ya existía (password reset + email verificado):", u.email, "→ role", u.role);
      continue;
    }
    const created = await client.users.createUser({
      emailAddress: [u.email],
      password: PASSWORD,
      firstName: u.first,
      lastName: u.last,
      publicMetadata: { role: u.role },
    });
    const ea = created.emailAddresses.find((e) => e.emailAddress === u.email);
    if (ea) {
      await client.emailAddresses.updateEmailAddress(ea.id, { verified: true });
    }
    console.log("✓ Creado + email verificado:", u.email, "→ role", u.role);
  }

  console.log("\n=== CREDENCIALES DE PRUEBA ===");
  console.log("SuperAdmin :", SUPERADMIN_EMAIL);
  console.log("Dueño      : dueno@casaraizalquiler.com / " + PASSWORD);
  console.log("Cliente    : cliente@casaraizalquiler.com / " + PASSWORD);
}

main().catch((e) => {
  console.error("FAIL:", e);
  process.exit(1);
});
