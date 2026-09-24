// Uso: set -a && . ./.env.local && set +a && npm run db:seed:admin
import { db } from "@/shared/db/client";
import { plans, legalDocs } from "@/shared/db/schema";
import { eq } from "drizzle-orm";

const PLANS = [
  { plan: "renter_monthly", name: "Inquilino mensual", amountCents: 900, currency: "eur", interval: "month", maxListings: 0, stripePriceId: process.env.STRIPE_PRICE_RENTER_MONTHLY ?? null },
  { plan: "owner_monthly", name: "Dueño mensual", amountCents: 1900, currency: "eur", interval: "month", maxListings: 3, stripePriceId: process.env.STRIPE_PRICE_OWNER_MONTHLY ?? null },
  { plan: "owner_yearly", name: "Dueño anual", amountCents: 14900, currency: "eur", interval: "year", maxListings: 15, stripePriceId: process.env.STRIPE_PRICE_OWNER_YEARLY ?? null },
];

const DOCS = [
  {
    slug: "terminos",
    title: "Términos y condiciones",
    content: `TÉRMINOS Y CONDICIONES — CASARAIZ

1. Objeto
CasaRaiz conecta dueños e inquilinos para el alquiler de vivienda sin comisiones de intermediación. El servicio se presta mediante membresía recurrente.

2. Membresías y precios
- Inquilino: 9 €/mes. Dueño: 19 €/mes o 149 €/año (IVA incluido).
- El pago es recurrente con tarjeta o SEPA vía Stripe. Bizum solo para pagos únicos.
- Puedes cancelar en cualquier momento desde tu cuenta; mantienes el acceso hasta el fin del periodo pagado. Sin reembolsos parciales.

3. Obligaciones del dueño
- Ser titular o estar autorizado para arrendar el inmueble.
- Publicar información veraz (precio, superficie, estado, fotos reales).
- Fianza de 1 mensualidad conforme a la LAU, depositada en el organismo autonómico correspondiente.

4. Obligaciones del inquilino
- Verificar su identidad (DNI/NIE) antes de contactar.
- Usar el contacto solo para fines de alquiler.

5. CasaRaiz no es parte del contrato de arrendamiento. No custodia fianzas ni gestiona pagos entre partes.

6. Baja y expulsión por fraude, anuncios falsos o acoso, sin reembolso.`,
  },
  {
    slug: "privacidad",
    title: "Política de privacidad",
    content: `POLÍTICA DE PRIVACIDAD — CASARAIZ (RGPD / LOPDGDD)

Responsable: CasaRaiz. Contacto: hola@casaraiz.es.

1. Datos que tratamos
Identidad y contacto (email, teléfono), verificación DNI/NIE, anuncios y mensajes, datos de pago (gestionados por Stripe; no almacenamos tarjetas).

2. Finalidades y base jurídica
- Prestación del servicio (ejecución del contrato de membresía).
- Verificación antifraude (interés legítimo).
- Facturación y obligaciones fiscales (obligación legal).

3. Encargados: Clerk (identidad), Neon (alojamiento UE), Stripe (pagos), Brevo (emails).

4. Derechos: acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a hola@casaraiz.es. Reclamación ante la AEPD.

5. Conservación: mientras dure la cuenta y los plazos fiscales (6 años).`,
  },
  {
    slug: "conformidad",
    title: "Documento de conformidad del anunciante",
    content: `DECLARACIÓN DE CONFORMIDAD DEL ANUNCIANTE — CASARAIZ

El dueño que publica un inmueble declara bajo su responsabilidad:

1. Que es propietario o dispone de autorización expresa del propietario para arrendar.
2. Que la vivienda cumple condiciones de habitabilidad y dispone de cédula o documentación exigible.
3. Que el precio, la superficie, las fotos y la descripción del anuncio son veraces y actuales.
4. Que exigirá como máximo 1 mes de fianza (LAU) y la depositará en el organismo autonómico.
5. Que no cobrará al inquilino comisión, honorarios ni gastos de gestión vinculados al anuncio.
6. Que acepta la verificación de identidad y la retirada del anuncio en caso de falsedad.

Fecha y firma: se registra automáticamente al publicar cada anuncio.`,
  },
];

async function main() {
  for (const p of PLANS) {
    const existing = await db.select().from(plans).where(eq(plans.plan, p.plan)).limit(1);
    if (existing.length === 0) {
      await db.insert(plans).values({ ...p, active: true });
      console.log("plan creado:", p.plan);
    } else {
      await db.update(plans).set({ name: p.name, maxListings: p.maxListings, stripePriceId: p.stripePriceId ?? existing[0].stripePriceId }).where(eq(plans.plan, p.plan));
      console.log("plan existe:", p.plan);
    }
  }
  for (const d of DOCS) {
    const existing = await db.select().from(legalDocs).where(eq(legalDocs.slug, d.slug)).limit(1);
    if (existing.length === 0) {
      await db.insert(legalDocs).values(d);
      console.log("doc creado:", d.slug);
    } else {
      console.log("doc existe:", d.slug);
    }
  }
}

main().catch((e) => {
  console.error("SEED_ADMIN_FAIL:", e);
  process.exit(1);
});
