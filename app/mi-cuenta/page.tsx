import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/shared/db/client";
import { contacts, properties } from "@/shared/db/schema";
import { count, eq, or } from "drizzle-orm";
import { getUserByClerkId, hasActiveSubscription, latestSubscription } from "@/modules/users/queries";
import { PortalButton } from "@/modules/billing/components/BillingButtons";
import { RoleSwitch } from "./RoleSwitch";
import VerificationForm from "./VerificationForm";

export default async function MiCuenta() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const me = await getUserByClerkId(userId);
  if (!me) redirect("/sign-in");

  const [[np], [nc], active, sub] = await Promise.all([
    db.select({ n: count() }).from(properties).where(eq(properties.ownerId, me.id)),
    db.select({ n: count() }).from(contacts).where(or(eq(contacts.renterId, me.id), eq(contacts.ownerId, me.id))),
    hasActiveSubscription(me.id),
    latestSubscription(me.id),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold text-mar-950">Mi cuenta</h1>
      <p className="mt-1 text-sm text-mar-950/55">{me.email} · DNI {me.dniVerified ? "verificado ✓" : "pendiente"}</p>

      <section className="mt-6 rounded-2xl border border-mar-100 bg-white p-5">
        <p className="font-semibold text-mar-900">Soy...</p>
        <div className="mt-3"><RoleSwitch role={me.role} /></div>
      </section>

      <section className="mt-4 rounded-2xl border border-mar-100 bg-white p-5">
        <p className="font-semibold text-mar-900">Verificación de identidad</p>
        {me.verificationStatus === "verified" ? (
          <p className="mt-2 text-sm text-green-700">✓ Identidad verificada ({me.docType ?? "documento"}). Tus anuncios y contactos muestran el sello.</p>
        ) : me.verificationStatus === "pending" ? (
          <p className="mt-2 text-sm text-otono-700">En revisión (24-48h). Te avisaremos por email.</p>
        ) : (
          <>
            {me.verificationStatus === "rejected" && (
              <p className="mt-2 text-sm text-otono-700">No pudimos verificar tu documento. Vuelve a intentarlo con fotos nítidas.</p>
            )}
            <VerificationForm />
          </>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-mar-100 bg-white p-5">
        <p className="font-semibold text-mar-900">Membresía</p>
        <p className="mt-1 text-sm text-mar-950/65">
          {active ? `Activa (${sub?.plan})` : "Sin membresía activa"}
          {sub?.currentPeriodEnd ? ` · hasta ${new Date(sub.currentPeriodEnd).toLocaleDateString("es-ES")}` : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {!active && (
            <Link href="/precios" className="rounded-full bg-otono-600 px-5 py-2 text-sm text-white hover:bg-otono-700">
              Ver planes
            </Link>
          )}
          <PortalButton />
        </div>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { href: "/duenos", t: "Mis pisos", d: `${np.n} publicados` },
          { href: "/buscar", t: "Buscar piso", d: "Como inquilino" },
          { href: "/publicar", t: "Publicar", d: "Nuevo anuncio" },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="rounded-2xl border border-mar-100 bg-white p-5 hover:shadow-lg">
            <p className="font-semibold text-mar-900">{c.t}</p>
            <p className="text-sm text-mar-950/55">{c.d} · {nc.n} contactos</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
