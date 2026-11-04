import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/modules/auth/guard";

export async function GET() {
  const admin = await getAdminIdentity().catch(() => null);
  // El enlace "Admin" del navbar solo se muestra al superadmin (rgutierrez2090@gmail.com).
  return NextResponse.json({ isAdmin: !!admin, isSuperAdmin: admin?.role === "superadmin" });
}
