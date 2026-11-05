import { Metadata } from "next";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/shared/db/client";
import { users } from "@/shared/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description: "Conoce al equipo detrás de CasaRaiz, el marketplace de alquiler temporal sin comisiones en Valencia.",
  alternates: { canonical: "/quienes-somos" },
};

export default async function QuienesSomosPage() {
  let superadminName = "CasaRaiz";
  let superadminEmail = "";
  let profile: { email?: string; photoUrl?: string | null; whatsapp?: string | null } | null = null;

  try {
    const client = await clerkClient();
    const usersList = await client.users.getUserList();
    const superadmin = usersList.data.find(
      (u) => (u.publicMetadata as { role?: string })?.role === "superadmin"
    );
    if (superadmin) {
      superadminName = `${superadmin.firstName ?? ""} ${superadmin.lastName ?? ""}`.trim() || "CasaRaiz";
      superadminEmail = superadmin.emailAddresses[0]?.emailAddress ?? "";
      const [row] = await db
        .select({ email: users.email, photoUrl: users.photoUrl, whatsapp: users.whatsapp })
        .from(users)
        .where(eq(users.clerkId, superadmin.id))
        .limit(1);
      if (row) profile = row;
    }
  } catch {
    // Si Clerk falla, mostramos la página sin datos de superadmin
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-mar-900 sm:text-5xl">Quiénes somos</h1>
        <p className="mt-4 text-lg text-mar-950/65">
          Detrás de CasaRaiz hay personas reales, no una inmobiliaria sin rostro.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="flex flex-col items-center">
          {profile?.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt="Foto de perfil"
              className="w-48 h-48 rounded-full object-cover border-4 border-mar-100 shadow-lg"
            />
          ) : (
            <div className="w-48 h-48 rounded-full bg-mar-100 flex items-center justify-center">
              <span className="text-mar-900/40 text-4xl">👤</span>
            </div>
          )}
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-bold text-mar-900">{superadminName}</h2>
            <p className="mt-1 text-sm text-mar-950/60">{superadminEmail}</p>
            {profile?.whatsapp && (
              <a
                href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-otono-600 px-4 py-2 text-sm font-medium text-white hover:bg-otono-700"
              >
                <span>💬</span> WhatsApp
              </a>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-mar-100 bg-white p-6 md:p-8">
            <h3 className="text-xl font-semibold text-mar-900 mb-4">Nuestra historia</h3>
            <p className="text-sm text-mar-950/70 leading-relaxed mb-4">
              CasaRaiz nació de una experiencia personal: alquilar un piso temporal en Valencia y
              encontrarse con comisiones ocultas, contratos en papel y dueños inaccesibles.
              Decidimos construir algo diferente: un marketplace donde dueños e inquilinos se
              contacten directo, sin comisiones de intermediación.
            </p>
            <p className="text-sm text-mar-950/70 leading-relaxed">
              Los inquilinos usan la plataforma gratis. Los dueños pagan una membresía anual
              o mensual según sus pisos publicados. Sin comisiones por alquiler, sin sorpresas.
            </p>
          </section>

          <section className="rounded-2xl border border-mar-100 bg-white p-6 md:p-8">
            <h3 className="text-xl font-semibold text-mar-900 mb-4">¿Por qué existe CasaRaiz?</h3>
            <ul className="space-y-3 text-sm text-mar-950/70">
              <li className="flex items-start gap-3">
                <span className="text-otono-600">✓</span>
                <span>Inquilinos gratis: buscar, contactar y chatear cuesta 0 €.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-otono-600">✓</span>
                <span>Dueños pagan solo la membresía, no comisión por alquiler.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-otono-600">✓</span>
                <span>Contratos de temporada (LAU) firmados digitalmente.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-otono-600">✓</span>
                <span>Identidad verificada de cada dueño antes de publicar.</span>
              </li>
            </ul>
          </section>
        </div>
      </div>

      <section className="mt-16 rounded-2xl border border-mar-100 bg-white p-8 text-center">
        <h3 className="text-2xl font-semibold text-mar-900 mb-4">¿Tienes una propiedad en Valencia?</h3>
        <p className="mb-6 text-sm text-mar-950/70 max-w-md mx-auto">
          Publica tu piso sin comisión y recibe contactos de inquilinos verificados.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/publicar" className="rounded-full bg-otono-600 px-6 py-3 font-medium text-white hover:bg-otono-700">
            Publicar mi piso
          </Link>
          <Link href="/buscar" className="rounded-full border border-mar-200 bg-white px-6 py-3 font-medium text-mar-900 hover:bg-mar-50">
            Buscar piso
          </Link>
        </div>
      </section>
    </main>
  );
}
