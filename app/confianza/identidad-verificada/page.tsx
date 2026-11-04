import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Identidad verificada · CasaRaiz",
  description: "Cada dueño verifica su DNI o pasaporte antes de publicar su piso en CasaRaiz. Tú sabes con quién trata.",
  alternates: { canonical: "/confianza/identidad-verificada" },
};

export default function IdentidadVerificadaPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-mar-950">Identidad verificada</h1>
      <p className="mt-2 text-mar-950/65">
        Para publicar un piso en CasaRaiz, el dueño debe pasar por un proceso de verificación de identidad. Subimos foto del DNI o pasaporte (anverso y reverso) y nuestro equipo la revisa en 24-48 horas.
      </p>

      <section className="mt-10 rounded-2xl border border-mar-100 bg-white p-6">
        <h2 className="text-xl font-semibold text-mar-900 mb-4">¿Cómo funciona la verificación?</h2>
        <ol className="space-y-4 text-sm text-mar-950/70 list-disc list-inside">
          <li>El dueño sube una foto clara de su documento de identidad (DNI, NIE o pasaporte).</li>
          <li>Nuestro equipo revisa que los datos coincidan con la cuenta de propietario.</li>
          <li>Si todo es correcto, se activa el sello de “Identidad verificada” en su perfil y en todos sus anuncios.</li>
          <li>Si el documento no es válido, se rechaza y se pide reenvío con fotos nítidas.</li>
        </ol>
      </section>

      <section className="mt-10 rounded-2xl border border-mar-100 bg-white p-6">
        <h2 className="text-xl font-semibold text-mar-900 mb-4">¿Por qué es importante para ti?</h2>
        <ul className="space-y-3 text-sm text-mar-950/70">
          <li>Sabes que el dueño es una persona real y verificable.</li>
          <li>Reduce el riesgo de anuncios falsos o suplantación de identidad.</li>
          <li>El sello de verificado aparece en cada anuncio y en los contactos que recibes.</li>
        </ul>
      </section>

      <div className="mt-12 flex gap-3">
        <a href="/confianza/contrato-digital" className="rounded-full border border-mar-200 bg-white px-6 py-2.5 text-sm font-medium text-mar-900 hover:bg-mar-50">
          Contrato firmado digitalmente
        </a>
        <a href="/buscar" className="rounded-full bg-otono-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-otono-700">
          Buscar piso
        </a>
      </div>
    </main>
  );
}
