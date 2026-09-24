# Arquitectura técnica — CasaRaiz

## Visión general

CasaRaiz es una aplicación **Next.js 16** (App Router) desplegada en **Vercel**, con un backend "serverless" integrado en el mismo proyecto (Route Handlers y Server Actions). No hay servidor separado: toda la lógica vive en funciones de Next.js.

```
Navegador ──► Vercel Edge/Serverless (Next.js)
                 │
                 ├── Clerk (auth, sessiones)
                 ├── Neon Postgres (datos, Drizzle ORM)
                 ├── Stripe (pagos de membresía)
                 ├── Brevo (email transaccional)
                 └── R2 (fotos, pendiente)
```

## Estructura de carpetas

```
app/                      Rutas (solo orquestan, sin lógica de negocio)
  api/                    Endpoints REST (Route Handlers)
  admin/                  Panel de administración
  duenos/                 Panel del dueño
  (públicas)              /, /buscar, /mapa, /precios, /p/[slug], /legal/[slug], ...
modules/                  Dominios (schema + queries + componentes + actions)
shared/                   Código transversal (db client, schema re-export, UI, utils)
scripts/                  Seeds y utilidades de mantenimiento
drizzle/                  Migraciones SQL generadas
```

Principio: **un dominio = un módulo**. Las rutas importan de `@/modules/*` y `@/shared/*`, nunca al revés.

## Módulos (dominios)

| Módulo | Responsabilidad | Archivos clave |
|--------|----------------|----------------|
| `users` | Usuarios (vinculados a Clerk), verificación | `schema.ts`, `queries.ts`, `actions.ts` |
| `properties` | Inmuebles, búsqueda, mapa, geocoding | `schema.ts`, `validation.ts`, `geocode.ts`, `components/*` |
| `bookings` | Reservas y valoraciones | `schema.ts` (bookings + reviews), `queries.ts`, `components/*` |
| `billing` | Planes, tramos de tarifa, Stripe | `schema.ts`, `stripe.ts`, `plans.ts`, `fees.ts`, `components/*` |
| `contacts` | Contacto inquilino↔dueño | `schema.ts`, `components/ContactBox.tsx` |
| `audit` | Log de auditoría | `schema.ts`, `log.ts` |
| `auth` | Guard de admin | `guard.ts`, `components/AdminLink.tsx` |
| `admin` | Server actions + UI del panel | `actions.ts`, `components/*` |
| `content` | Barrios, textos legales | `barrios.ts`, `legal-docs-seed.ts` |
| `notifications` | Email (Brevo) | `email.ts` |

## Base de datos (Neon + Drizzle)

- **Cliente**: `shared/db/client.ts` (`drizzle(neon(DATABASE_URL))`, driver `neon-http`).
- **Schema**: cada `modules/*/schema.ts` define sus tablas; `shared/db/schema.ts` las re-exporta; `drizzle.config.ts` las lista para `drizzle-kit`.
- **Migraciones**: `drizzle/` generadas con `npm run db:generate` y aplicadas con `npm run db:migrate`.

### Tablas principales

| Tabla | Descripción | Campos clave |
|-------|-------------|--------------|
| `users` | Usuario (espejo de Clerk) | `clerkId` (unique), `role`, `email`, `verificationStatus`, `docType`, `stripeCustomerId` |
| `properties` | Inmueble | `ownerId`, `priceCents`, `rooms/baths/m2`, `maxHuespedes`, `disponibleDesde/Hasta`, `city/barrio/entorno`, `slug` (unique), `photos`, `status` |
| `bookings` | Reserva | `propertyId`, `renterId`, `ownerId`, `checkin/checkout`, `guests`, `status` |
| `reviews` | Valoración | `bookingId`, `kind` (`to_owner/to_renter`), `servicio/comunicacion/entorno/actitud`, `comment` |
| `contacts` | Mensaje de contacto | `propertyId`, `renterId`, `ownerId` |
| `subscriptions` | Membresía | `userId`, `plan`, `status`, `currentPeriodEnd`, `stripeSubId` |
| `plans` | Planes fijos (anual) | `plan`, `amountCents`, `interval`, `stripePriceId`, `maxListings` |
| `fee_tiers` | Tramos de tarifa (mensual) | `minProps`, `maxProps`, `amountCents`, `label` |
| `site_settings` | Ajustes (leyenda, contacto) | `key`, `value` |
| `legal_docs` | Documentos legales | `slug`, `title`, `content` |
| `audit_logs` | Auditoría | `action`, `entity`, `meta`, `reason` |

## API (Route Handlers)

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/properties` | GET/POST | Listar (filtros ciudad/barrio/entorno) / crear (exige plan dueño) |
| `/api/properties/[id]` | PATCH | Editar (solo dueño) |
| `/api/bookings` | POST | Crear reserva |
| `/api/bookings/[id]` | PATCH | Aceptar/rechazar reserva |
| `/api/reviews` | POST | Crear valoración (post-checkout) |
| `/api/contacts` | GET/POST | Contacto (inquilinos gratis) |
| `/api/checkout` | POST | Stripe Checkout (precio por tramo si es mensual) |
| `/api/portal` | POST | Stripe Customer Portal |
| `/api/webhooks/stripe` | POST | Sincronizar suscripciones |
| `/api/upload` | POST | URL presigned para subir foto (R2) |
| `/api/mis-pisos` | GET | Pisos + capacidad del dueño |
| `/api/admin/me` | GET | ¿Es admin el usuario actual? |
| `/api/cron/review-reminders` | GET | Recordatorio de valoración 24h (cron) |

## Autenticación y roles

- **Clerk** gestiona login (email/social). `proxy.ts` es el middleware que protege rutas/API.
- **Admin**: determinado por `ADMIN_EMAILS` (env) o `publicMetadata.role === "admin"` en Clerk (`modules/auth/guard.ts`). `requireAdmin()` devuelve 404 si no es admin.
- **Verificación de identidad**: el usuario sube DNI/pasaporte (`/mi-cuenta`), queda `pending`, el admin aprueba/rechaza (`decideVerification`), activando `dniVerified`.

## Pagos (Stripe)

- **Planes anuales**: `plans` + `STRIPE_PRICE_OWNER_YEARLY`.
- **Mensual por tramos**: `fee_tiers`; el checkout calcula el tramo según los pisos activos del dueño y crea un price inline (`price_data`), así no hay que pre-crear un price por tramo.
- **IVA**: `tax_behavior: "inclusive"`.
- **Suscripción**: `mode: "subscription"`, `payment_method_types: ["card"]` (SEPA/Bizum pendientes).
- Sincronización: webhook (`/api/webhooks/stripe`) + fallback en `/membresia/ok`.

## Valoraciones

- `reviews` con `kind` y criterios 1–5. Una por `bookingId`+`kind` (sin duplicados).
- `getPropertyRating`, `getUserRating`, `getRatingsForProperties` en `modules/bookings/queries.ts` calculan medias.
- `/buscar` ordena por defecto por mejor nota media (`destacados`).
- Recordatorio a las 24h: cron diario (`vercel.json`) → `/api/cron/review-reminders` → email Brevo (o log si no hay key).

## Despliegue

- **Vercel**, dominio `casaraizalquiler.com` (nameservers apuntando a Vercel).
- Env en Vercel (no en el repo). `NEXT_PUBLIC_SITE_URL` apunta al dominio.
- CI: `.github/workflows/ci.yml` (lint + tsc + build) en push/PR/tag.
- Repos: `casaraiz` (público, remoto `origin`) y `casaraiz-privado` (remoto `privado`).
