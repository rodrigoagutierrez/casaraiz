<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — CasaRaiz (contexto para agentes)

> Lee esto al abrir el proyecto. Resume TODO lo necesario para trabajar sin re-explorar el código.

## 1. Qué es CasaRaiz

Marketplace de **alquiler temporal** (media estancia) en España, **sin comisiones**. Los **inquilinos son gratis** (solo cuenta verificada); los **dueños pagan membresía por tramos** según nº de pisos. No hay comisión por alquiler entre partes. (Ya NO es "alquiler de larga estancia con fianza 1 mes" — es temporada, fianza 2 meses.)

## 2. Stack y versiones (no cambiar sin avisar)

- **Next.js 16** (App Router, `next dev` usa Turbopack). ATENCIÓN: hay breaking changes vs Next 13/14 (leer `node_modules/next/dist/docs/` si tocas convenciones).
- **React 19**, **TypeScript 5** (`strict`), **Tailwind CSS 4** (config en `app/globals.css` con `@theme`, NO `tailwind.config.js`).
- **Neon Postgres** (driver `@neondatabase/serverless`, `neon-http`) + **Drizzle ORM** (`drizzle-orm`, `drizzle-kit`).
- **Clerk** (`@clerk/nextjs`) — auth. `proxy.ts` es el middleware (NO `middleware.ts`).
- **Stripe** — pagos de membresía. **Leaflet** — mapa. **zod** — validación.
- **Vercel** — hosting (dominio `casaraizalquiler.com`, nameservers en Vercel).
- **Brevo** — email transaccional (stub si no hay `BREVO_API_KEY`).

## 3. Estructura (importante: código modular)

```
app/            # Rutas Next.js (delgadas: solo orquestan)
  api/          # Route handlers (REST)
  admin/        # Panel admin (/admin/*)
  duenos/       # Panel dueño
  buscar, mapa, precios, publicar, reservas, mi-cuenta, p/[slug], legal/[slug]
modules/        # CÓDIGO REAL por dominio
  users/        schema + queries (getOrCreateUser, hasActiveSubscription) + actions
  properties/   schema + validation + geocode + componentes (SearchBar, PropertyCard, FiltersBar, CategoryRow, Map, PropertiesMap)
  bookings/     schema (bookings + reviews) + queries (ratings) + componentes (BookingBox, ReviewForm, Stars, DecisionButtons)
  billing/      schema (plans, fee_tiers, site_settings) + stripe + fees + plans + components
  contacts/     schema + ContactBox
  audit/        schema (audit_logs) + log()
  auth/         guard admin + AdminLink
  admin/        actions + componentes del panel
  content/      barrios (Valencia) + legal-docs-seed
  notifications/email.ts   # Brevo stub
shared/
  db/           client (Neon) + schema (re-exporta todos los módulos)
  ui/           Header, Footer
  utils/        format (eur)
scripts/        seeds y create-stripe-prices
```

Regla: código nuevo va en su módulo; las rutas solo importan de `@/modules/*` y `@/shared/*`. No crear carpetas `lib/` ni `components/` en la raíz.

## 4. Base de datos (Neon + Drizzle)

- Schema fuente en cada `modules/*/schema.ts`. `shared/db/schema.ts` re-exporta todo. `drizzle.config.ts` lista los schemas.
- Migraciones en `drizzle/`. Comandos: `npm run db:generate` y `npm run db:migrate`.
- PostGIS: `CREATE EXTENSION IF NOT EXISTS postgis` ya aplicado; `lat`/`lng` se guardan como text (geo real pendiente).
- Tablas: `users`, `properties`, `bookings`, `reviews`, `contacts`, `favorites`, `subscriptions`, `plans`, `fee_tiers`, `site_settings`, `legal_docs`, `audit_logs`.
- `users.verification_status` = `none|pending|verified|rejected` + `doc_type`, `doc_front_url`, `doc_back_url` (verificación DNI/pasaporte).

## 5. Modelo de negocio / reglas de dominio

- **Inquilinos gratis**: `POST /api/contacts` NO exige membresía (solo login). Publicar (`POST /api/properties`) SÍ exige plan de dueño.
- **Capacidad de publicación**: `getPublishCapacity(userId)` en `modules/billing/plans.ts`. El plan mensual usa los tramos de `fee_tiers`; el anual es fijo (15).
- **Tarifas por tramos**: `fee_tiers` (minProps, maxProps, amountCents, label). `amountCents=null` = "a consultar". Se editan en `/admin/tarifas`.
- **Checkout mensual dinámico**: `app/api/checkout/route.ts` calcula el tramo según los pisos del dueño y crea un price inline (no usa price fijo).
- **Reservas**: tabla `bookings` (status `pending|confirmed|declined|canceled`, checkin/checkout, guests).
- **Valoraciones**: tabla `reviews` con `kind` `to_owner|to_renter`. Criterios: `servicio, comunicacion, entorno` (dueño) / `actitud` (inquilino). Solo tras checkout confirmado, ventana 30 días (`reviewWindow`), se anima en las 24h.
- **Orden de búsqueda**: `/buscar` ordena por defecto "destacados" = mejor puntuadas primero (`nulls last`).

## 6. Variables de entorno (ver `.env.example`)

`DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`, `R2_*`, `ADMIN_EMAILS`, `NEXT_PUBLIC_SITE_URL`, `BREVO_API_KEY`, `BREVO_SENDER`, `CRON_SECRET`.

Notas:
- `STRIPE_PRICE_RENTER_MONTHLY` ya NO se usa (inquilinos gratis); queda en `.env.example` por compat.
- `RESEND_API_KEY` y `NEXT_PUBLIC_MAPBOX_TOKEN` son obsoletas (se usa Brevo y OSM/Leaflet).
- **Jamás** pongas secretos en archivos del repo; solo en `.env.local` (gitignored). Las claves reales están en Vercel env.

## 7. Colores / tema

Paleta en `app/globals.css` (`@theme`): **azul mar** (`--color-mar-*`, `#062640`–`#eff6fb`) y **naranja otoño** (`--color-otono-*`, acento `#bc5f1a`). Fondo `#f2f7fb`. No usar "coral" (desapareció). Logo: `public/logo.jpg` (header) + `app/icon.jpg` (favicon). Hero: `public/hero.jpg` con efecto Ken Burns (`.kenburns` en globals.css).

## 8. Verificación de cambios

Siempre, antes de terminar:
```bash
npm run lint && npx tsc --noEmit && npm run build
```
Y si toqué schema: `npm run db:generate && npm run db:migrate` (con `.env.local` cargado).

## 9. Estado actual / pendientes

**Hecho**: MVP completo — búsqueda temporal (fechas+huéspedes), categorías por entorno, mapa, publicar/editar, reservas, valoraciones bidireccionales, verificación de identidad, panel admin (usuarios, suscripciones, tarifas por tramos, documentos), tarifas por tramos, recordatorio 24h (cron + Brevo stub), responsive, CI (GitHub Actions), despliegue Vercel con dominio propio.

**Pendientes conocidos**:
1. **Fotos reales**: subida usa `/api/upload` con presigned R2, pero R2 no está activado (devuelve 503 → el formulario acepta URLs manuales). Los seeds usan `picsum.photos`.
2. **Webhook Stripe**: `STRIPE_WEBHOOK_SECRET` no configurado en prod; `/membresia/ok` sincroniza sin webhook.
3. **Email real**: Brevo necesita `BREVO_API_KEY`; sin él, `sendEmail` solo loguea.
4. **CRON_SECRET** sin configurar (endpoint `/api/cron/review-reminders` responde 200 sin secret).
5. **Dominio en Clerk/Stripe**: añadir `casaraizalquiler.com` en Clerk (Domains) y Stripe.
6. **Calendario noche a noche**: las fechas filtran por ventana del dueño (`disponibleDesde/Hasta`), no hay calendario de reservas por día.
7. **Geocoding** vía Nominatim (gratis, sin API key), limitado a España.

## 10. Convenciones rápidas

- Rutas en español para SEO: `/alquiler-sin-comision/valencia/[barrio]`, `/buscar`, `/publicar`, `/precios`, `/reservas`, `/mi-cuenta`.
- IDs de usuario: Clerk `userId` → `users.clerkId` único; `users.id` (uuid) es FK interna.
- `auth()` es async (Clerk v7): `const { userId } = await auth()`.
- Server actions en `modules/*/actions.ts` con `"use server"`.
- `logAudit(...)` para cualquier acción sensible (ver tipos en `modules/audit/log.ts`).
- Deploy: `git push` a `origin` (público) y `privado`, luego `npx vercel --prod`.
