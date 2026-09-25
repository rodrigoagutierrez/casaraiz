import { auth, clerkClient } from "@clerk/nextjs/server";

function allowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAdminIdentity() {
  const { userId } = await auth();
  if (!userId) return null;
  const client = await clerkClient();
  const cu = await client.users.getUser(userId);
  const email = cu.emailAddresses[0]?.emailAddress?.toLowerCase() ?? "";
  const role = (cu.publicMetadata as { role?: string })?.role;
  if (role === "admin" || role === "superadmin" || (email && allowlist().includes(email))) {
    return { clerkId: userId, email, role };
  }
  return null;
}

export async function requireSuperAdmin() {
  const admin = await getAdminIdentity();
  if (!admin || admin.role !== "superadmin") {
    const { notFound } = await import("next/navigation");
    notFound();
  }
  return admin!;
}

export async function requireAdmin() {
  const admin = await getAdminIdentity();
  if (!admin) {
    const { notFound } = await import("next/navigation");
    notFound();
  }
  return admin!;
}
