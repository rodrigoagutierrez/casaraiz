# CasaRaiz

Marketplace de **alquiler temporal** (media estancia) en toda España, **sin comisiones**. Conecta dueños e inquilinos directos: los inquilinos contactan gratis y los dueños pagan una membresía por tramos según el número de pisos que publican.

## Qué ofrece

- **Búsqueda temporal**: lugar, fechas de check-in/check-out y número de huéspedes.
- **Categorías por entorno**: Playa, Montaña, Bosque, Ciudad, Río (+ Mapa).
- **Mapa** con todos los pisos (Leaflet + OpenStreetMap, sin coste).
- **Reservas**: el inquilino solicita, el dueño acepta o rechaza. Precio por noche.
- **Chat** dueño↔inquilino estilo WhatsApp (texto + fotos comprimidas).
- **Favoritos**: corazón en cada anuncio + página "Mis favoritos".
- **Garantía CasaRaiz (opcional)**: canon único del inquilino vía Stripe, cobertura vía aseguradora colaboradora.
- **Valoraciones bidireccionales** (1–5 estrellas):
  - Inquilino → Dueño: Servicio, Comunicación, Entorno.
  - Dueño → Inquilino: Actitud.
  - Se muestran en cada piso y la búsqueda ordena las mejores puntuadas primero.
- **Verificación de identidad**: DNI/NIE o Pasaporte (anverso + reverso), revisado por el equipo.
- **Nº de Registro Único obligatorio** (RD 1312/2024) visible en cada ficha.
- **Bilingüe ES/EN** (selector en el header).
- **Panel de administración**: usuarios, gestiones, suscripciones, tarifas por tramos, garantía, documentos legales e informes (con CSV).
- **Panel del dueño**: mis pisos, reservas entrantes e informes de ocupación/ganancias.

## Modelo de negocio

- **Inquilinos**: gratis (solo necesitan cuenta verificada).
- **Dueños**: planes por tramos (p. ej. 1–3 pisos, 4–10 pisos, 11+ a medida). Precio con IVA, pago recurrente con tarjeta o SEPA vía Stripe.
- **Garantía opcional**: canon único no reembolsable del inquilino (ruta aseguradora colaboradora).
- **Sin comisión por alquiler** entre partes.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend/Backend | Next.js 16 (App Router, TypeScript) + Tailwind CSS 4 |
| Base de datos | Neon Postgres (EU) + Drizzle ORM (+ PostGIS preparado) |
| Autenticación | Clerk |
| Pagos | Stripe (Billing + Tax IVA) |
| Mapa | Leaflet + OpenStreetMap |
| Email | Brevo (transaccional) |
| Hosting | Vercel (dominio `casaraizalquiler.com`) |
| Imágenes | R2/Cloudflare (pendiente de activar) |

## Cómo ejecutar

```bash
npm install
cp .env.example .env.local   # rellena las claves (ver sección Variables)
npm run db:migrate           # aplica migraciones a Neon
npm run db:seed              # 12 pisos demo + owner demo
npm run db:seed:admin        # planes + tramos de tarifa + documentos legales
npm run dev                  # http://localhost:3000
```

## Scripts

```bash
npm run dev            # servidor de desarrollo
npm run build          # build de producción
npm run lint           # ESLint
npm run db:generate    # genera migración desde schema
npm run db:migrate     # aplica migraciones
npm run db:seed        # pisos demo (Valencia, Madrid, Barcelona, Sevilla)
npm run db:seed:admin  # planes, tarifas, documentos legales
npm run db:studio      # explorador visual de la BD
npx tsx scripts/seed-fees.ts         # tramos de tarifa + ajustes
npx tsx scripts/seed-docs-temporal.ts # documentos legales (temporada)
```

## Despliegue

Desplegado en Vercel. El dominio `casaraizalquiler.com` está en Hostinger con los nameservers apuntando a Vercel (`ns1/ns2.vercel-dns.com`). Autodeploy configurable conectando el repo en Vercel.

```bash
npx vercel --prod   # despliega (requiere sesión de Vercel)
```

## Documentación

- **[docs/ARQUITECTURA.md](docs/ARQUITECTURA.md)** — arquitectura técnica: módulos, base de datos, API.
- **[docs/GUIA_USO.md](docs/GUIA_USO.md)** — guía de uso para dueños, inquilinos y administrador.

## Repositorios

- Público: `https://github.com/rodrigoagutierrez/casaraiz`
- Privado: `https://github.com/rodrigoagutierrez/casaraiz-privado` (remoto `privado`)
