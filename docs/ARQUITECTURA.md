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
| `properties` | Inmuebles, búsqueda, mapa, geocoding, favoritos | `schema.ts`, `validation.ts`, `geocode.ts`, `favorites.ts`, `components/*` (SearchBar, CompactSearch, PropertyCard, FavButton, FiltersBar, CategoryRow, Map, PropertiesMap, DescriptionBlock) |
| `bookings` | Reservas y valoraciones | `schema.ts` (bookings + reviews), `queries.ts`, `components/*` |
| `billing` | Planes, tramos de tarifa, Stripe, garantía | `schema.ts`, `stripe.ts`, `plans.ts`, `fees.ts`, `guarantee.ts`, `components/*` |
| `contacts` | Contacto inquilino↔dueño | `schema.ts`, `components/ContactBox.tsx` |
| `chat` | Conversaciones y mensajes | `schema.ts`, `queries.ts`, `components/*` |
| `reports` | Informes dueño/superadmin + CSV | `queries.ts`, `csv.ts` |
| `seo` | Datos estructurados | `JsonLd.tsx` |
| `i18n` | Diccionarios ES/EN, provider, switcher | `dictionaries.ts`, `provider.tsx`, `server.ts`, `components/LanguageSwitcher.tsx` |
| `audit` | Log de auditoría | `schema.ts`, `log.ts` |
| `auth` | Guard admin/superadmin | `guard.ts`, `components/AdminLink.tsx` |
| `admin` | Server actions + UI del panel | `actions.ts`, `components/*` |
| `content` | Barrios, ciudades, textos legales | `barrios.ts`, `ciudades.ts`, `legal-docs-seed.ts` |
| `notifications` | Email (Brevo) | `email.ts` |

## Base de datos (Neon + Drizzle)

- **Cliente**: `shared/db/client.ts` (`drizzle(neon(DATABASE_URL))`, driver `neon-http`).
- **Schema**: cada `modules/*/schema.ts` define sus tablas; `shared/db/schema.ts` las re-exporta; `drizzle.config.ts` las lista para `drizzle-kit`.
- **Migraciones**: `drizzle/` generadas con `npm run db:generate` y aplicadas con `npm run db:migrate`.

### Tablas principales

| Tabla | Descripción | Campos clave |
|-------|-------------|--------------|
| `users` | Usuario (espejo de Clerk) | `clerkId` (unique), `role`, `email`, `verificationStatus`, `docType`, `stripeCustomerId` |
| `properties` | Inmueble (**precio en €/noche**) | `ownerId`, `priceCents`, `rooms/baths/m2`, `maxHuespedes`, `disponibleDesde/Hasta`, `city/barrio/entorno`, `registroNumero/Tipo`, `referenciaCatastral`, `slug` (unique), `photos`, `status` |
| `bookings` | Reserva | `propertyId`, `renterId`, `ownerId`, `checkin/checkout`, `guests`, `status`, `garantiaOptada/ImporteCents/Estado` |
| `reviews` | Valoración | `bookingId`, `kind` (`to_owner/to_renter`), `servicio/comunicacion/entorno/actitud`, `comment` |
| `contacts` | Mensaje de contacto | `propertyId`, `renterId`, `ownerId` |
| `favorites` | Favoritos | `userId`, `propertyId` |
| `conversations` | Chat (1 por piso+inquilino) | `propertyId`, `renterId`, `ownerId` |
| `messages` | Mensaje (texto o imagen comprimida) | `conversationId`, `senderId`, `readAt` |
| `subscriptions` | Membresía | `userId`, `plan`, `status`, `kind` (`standard/seasonal`), `currentPeriodEnd`, `stripeSubId` |
| `plans` | Planes fijos (anual) | `plan`, `amountCents`, `interval`, `stripePriceId`, `maxListings` |
| `fee_tiers` | Tramos de tarifa (mensual) | `minProps`, `maxProps`, `amountCents`, `label` |
| `site_settings` | Ajustes (leyenda, contacto) | `key`, `value` |
| `legal_docs` | Documentos legales | `slug`, `title`, `content` |
| `audit_logs` | Auditoría | `action`, `entity`, `meta`, `reason` |

## API (Route Handlers)

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/properties` | GET/POST | Listar (filtros ciudad/barrio/entorno) / crear (exige plan dueño + NRA) |
| `/api/properties/[id]` | PATCH | Editar (solo dueño; activar exige NRA → `FALTA_REGISTRO`) |
| `/api/bookings` | POST | Crear reserva (acepta `garantia: true`, canon recalculado en servidor) |
| `/api/bookings/[id]` | PATCH | Aceptar/rechazar reserva |
| `/api/reviews` | POST | Crear valoración (post-checkout) |
| `/api/contacts` | GET/POST | Contacto (inquilinos gratis) |
| `/api/chat` | GET/POST | Listar conversaciones / crear conversación |
| `/api/chat/[id]` | GET/POST | Mensajes / enviar (texto o imagen) |
| `/api/favoritos` | GET/POST/DELETE | Listar / toggle / quitar favorito |
| `/api/garantia/config` | GET | Config pública de la garantía (para cotizar) |
| `/api/garantia/checkout` | POST | Checkout Stripe del canon (pago único) |
| `/api/reports/owner` | GET | CSV de reservas/ganancias del dueño |
| `/api/reports/subscriptions` | GET | CSV de suscripciones (solo admin) |
| `/api/checkout` | POST | Stripe Checkout (precio por tramo si es mensual) |
| `/api/portal` | POST | Stripe Customer Portal |
| `/api/webhooks/stripe` | POST | Sincronizar suscripciones |
| `/api/upload` | POST | URL presigned para subir foto (R2) |
| `/api/mis-pisos` | GET | Pisos + capacidad del dueño |
| `/api/admin/me` | GET | ¿Es admin el usuario actual? |
| `/api/cron/review-reminders` | GET | Recordatorio de valoración 24h (cron) |

## Autenticación y roles

- **Clerk** gestiona login (email/social). `proxy.ts` es el middleware que protege rutas/API.
- **Admin**: determinado por `ADMIN_EMAILS` (env) o `publicMetadata.role` (`admin`/`superadmin`) en Clerk (`modules/auth/guard.ts`). `requireAdmin()` y `requireSuperAdmin()` devuelven 404 si no corresponde.
- **Verificación de identidad**: el usuario sube DNI/pasaporte (`/mi-cuenta`), queda `pending`, el admin aprueba/rechaza (`decideVerification`), activando `dniVerified`.

## Pagos (Stripe)

- **Planes anuales**: `plans` + `STRIPE_PRICE_OWNER_YEARLY`.
- **Mensual por tramos**: `fee_tiers`; el checkout calcula el tramo según los pisos activos del dueño y crea un price inline (`price_data`), así no hay que pre-crear un price por tramo.
- **IVA**: `tax_behavior: "inclusive"`.
- **Suscripción**: `mode: "subscription"`, `payment_method_types: ["card"]` (SEPA/Bizum pendientes).
- **Garantía CasaRaiz (ruta A)**: opt-in en la reserva; canon = % del total con mín/tope (`site_settings garantia_*`); cobro único vía `POST /api/garantia/checkout`; el webhook (`metadata.tipo=garantia`) marca `pagada`. La prima se remite a la aseguradora colaboradora; la fianza legal (2 meses) sigue obligatoria.
- Sincronización: webhook (`/api/webhooks/stripe`) + fallback en `/membresia/ok`.

## Valoraciones

- `reviews` con `kind` y criterios 1–5. Una por `bookingId`+`kind` (sin duplicados).
- `getPropertyRating`, `getUserRating`, `getRatingsForProperties` en `modules/bookings/queries.ts` calculan medias.
- `/buscar` ordena por defecto por mejor nota media (`destacados`).
- Recordatorio a las 24h: cron diario (`vercel.json`) → `/api/cron/review-reminders` → email Brevo (o log si no hay key).

## Despliegue

- **Vercel**, dominio `casaraizalquiler.com` (propagado y activo; nameservers en Vercel).
- Env en Vercel (no en el repo). `NEXT_PUBLIC_SITE_URL` apunta al dominio.
- CI: `.github/workflows/ci.yml` (lint + tsc + build) en push/PR/tag.
- Repos: `casaraiz` (público, remoto `origin`) y `casaraiz-privado` (remoto `privado`).
