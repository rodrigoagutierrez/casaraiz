import { Metadata } from "next";
import Link from "next/link";
import { getSuperadminProfile } from "@/modules/users/profileActions";
import ProfileForm from "./ProfileForm";

export const metadata: Metadata = { title: "Mi perfil · Admin CasaRaiz" };

export default async function AdminProfilePage() {
  const profile = await getSuperadminProfile();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Link href="/admin" className="text-sm text-mar-600 hover:text-mar-800">
          ← Volver al panel
        </Link>
        <h1 className="text-2xl font-bold text-mar-900">Mi perfil (superadmin)</h1>
      </div>

      {profile ? (
        <ProfileForm initial={profile} />
      ) : (
        <div className="rounded-2xl border border-mar-100 bg-white p-6">
          <p className="text-sm text-mar-950/70">
            No se pudo cargar tu perfil de superadmin. Comprueba que tu cuenta tiene el rol{" "}
            <code className="rounded bg-mar-100 px-1">superadmin</code> en Clerk.
          </p>
        </div>
      )}
    </div>
  );
}
