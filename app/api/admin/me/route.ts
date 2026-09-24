import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/modules/auth/guard";

export async function GET() {
  const admin = await getAdminIdentity().catch(() => null);
  return NextResponse.json({ isAdmin: !!admin });
}
