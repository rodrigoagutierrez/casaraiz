import type { Metadata } from "next";
import Link from "next/link";
import WaitlistForm from "@/modules/contacts/components/WaitlistForm";

export const metadata: Metadata = {
  title: "Lista de espera",
  description:
    "Déjanos tu email, tu ciudad y si eres inquilino o dueño: te avisamos en cuanto CasaRaiz esté disponible en tu ciudad.",
  alternates: { canonical: "/lista-espera" },
  robots: { index: false },
};

export default async function ListaEsperaPage({
  searchParams,
}: {
  searchParams: Promise<{ ciudad?: string | string[] }>;
}) {
  const params = await searchParams;
  const ciudad = typeof params.ciudad === "string" ? params.ciudad : "";

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-bold text-mar-950">Lista de espera</h1>
      <p className="mt-3 text-mar-950/70">
        CasaRaiz está en Valencia y creciendo. Déjanos tu email y te avisamos en cuanto lleguemos a tu ciudad. Sin
        spam: un solo correo cuando haya novedades.
      </p>

      <div className="mt-6">
        <WaitlistForm ciudadInicial={ciudad} />
      </div>

      <p className="mt-6 text-sm text-mar-950/55">
        ¿Prefieres escribirnos?{" "}
        <a href="mailto:hola@casaraizalquiler.com" className="font-medium text-mar-700 underline">
          hola@casaraizalquiler.com
        </a>
        {" · "}
        <Link href="/preguntas-frecuentes" className="font-medium text-mar-700 underline">
          Preguntas frecuentes
        </Link>
      </p>
    </main>
  );
}
