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
  api/          # Route handlers (REST): properties, bookings, reviews, contacts, chat,
                # favoritos, checkout, portal, garantia, reports, upload, mis-pisos,
                # webhooks/stripe, cron/review-reminders, admin/me
  admin/        # Panel admin (/admin/*): panel, usuarios, gestiones, suscripciones,
                # precios, tarifas, garantia, documentos, informes
  duenos/       # Panel dueño (+ /duenos/informes, /duenos/pisos/[id]/editar)
  buscar, mapa, precios, publicar, reservas, mi-cuenta, chat, favoritos,
  p/[slug], legal/[slug], alquiler-temporal/[ciudad], alquiler-sin-comision/valencia/[barrio],
  comparativa, membresia/ok
modules/        # CÓDIGO REAL por dominio
  users/        schema + queries (getOrCreateUser, hasActiveSubscription) + actions
  properties/   schema + validation + geocode + componentes (SearchBar, CompactSearch,
                PropertyCard, FavButton, FiltersBar, CategoryRow, Map, PropertiesMap,
                DescriptionBlock)
  bookings/     schema (bookings + reviews) + queries (ratings) + componentes (BookingBox, ReviewForm, Stars, DecisionButtons)
  billing/      schema (plans, fee_tiers, site_settings) + stripe + fees + plans + guarantee + components
  contacts/     schema + ContactBox
  chat/         schema (conversations, messages) + queries + componentes (ChatButton, ChatThread)
  reports/      queries (informes dueño/superadmin) + csv.ts
  seo/          JsonLd.tsx (+ organizationLd, websiteLd)
  i18n/         dictionaries (es/en), provider (cookie `casaraiz-lang`), server, components/LanguageSwitcher
  audit/        schema (audit_logs) + log()
  auth/         guard admin/superadmin + AdminLink
  admin/        actions + componentes del panel
  content/      barrios (Valencia), ciudades, legal-docs-seed
  notifications/email.ts   # Brevo (real si hay BREVO_API_KEY, si no log)
shared/
  db/           client (Neon) + schema (re-exporta todos los módulos)
  ui/           Header (navbar sticky + CompactSearch + i18n), Footer
  utils/        format (eur)
scripts/        seeds (properties, admin, fees, docs-temporal), create-stripe-prices,
                test-rating, test-e2e-flows, setup-test-env, create-test-users
```

Regla: código nuevo va en su módulo; las rutas solo importan de `@/modules/*` y `@/shared/*`. No crear carpetas `lib/` ni `components/` en la raíz.

## 4. Base de datos (Neon + Drizzle)

- Schema fuente en cada `modules/*/schema.ts`. `shared/db/schema.ts` re-exporta todo. `drizzle.config.ts` lista los schemas.
- Migraciones en `drizzle/`. Comandos: `npm run db:generate` y `npm run db:migrate`.
- PostGIS: `CREATE EXTENSION IF NOT EXISTS postgis` ya aplicado; `lat`/`lng` se guardan como text (geo real pendiente).
- Tablas: `users`, `properties`, `bookings`, `reviews`, `contacts`, `favorites`, `conversations`, `messages`, `subscriptions`, `plans`, `fee_tiers`, `site_settings`, `legal_docs`, `audit_logs`.
- `users`: `verification_status` = `none|pending|verified|rejected` + `doc_type`, `doc_front_url`, `doc_back_url`; `stripeCustomerId`; rol Clerk en `publicMetadata.role` (`superadmin` para el titular).
- `properties.priceCents` = **€/noche** (no mensual). Campos: `entorno`, `maxHuespedes`, `disponibleDesde/Hasta`, `registroNumero` (NRA obligatorio para activar), `registroTipo` (`temporada|vut`), `referenciaCatastral`.
- `subscriptions.kind` = `standard|seasonal` (ofertas de temporada con `currentPeriodEnd` limitado).
- `bookings`: `garantiaOptada`, `garantiaImporteCents`, `garantiaEstado` (`ninguna|pendiente_pago|pagada`), `garantiaStripeSession`, `garantiaPagadaAt`.

## 5. Modelo de negocio / reglas de dominio

- **Inquilinos gratis**: `POST /api/contacts` NO exige membresía (solo login). Publicar (`POST /api/properties`) SÍ exige plan de dueño.
- **Precio de pisos en €/noche** (`priceCents`); filtros `min/max` en céntimos/noche.
- **NRA obligatorio (RD 1312/2024)**: publicar exige `registroNumero`; activar (`PATCH` a `active`) sin él devuelve `FALTA_REGISTRO`. Visible en ficha (badge + `Offer.identifier` en JSON-LD).
- **Capacidad de publicación**: `getPublishCapacity(userId)` en `modules/billing/plans.ts`. El plan mensual usa los tramos de `fee_tiers`; el anual es fijo (15).
- **Tarifas por tramos**: `fee_tiers` (minProps, maxProps, amountCents, label). `amountCents=null` = "a consultar". Se editan en `/admin/tarifas`.
- **Checkout mensual dinámico**: `app/api/checkout/route.ts` calcula el tramo según los pisos del dueño y crea un price inline (no usa price fijo).
- **Garantía CasaRaiz (ruta A, opcional)**: canon = % del total con mín/tope (`site_settings garantia_*`, `modules/billing/guarantee.ts`). Opt-in en `BookingBox`, cobro único vía `POST /api/garantia/checkout`, marca `pagada` el webhook (`metadata.tipo=garantia`). La aseguradora colaboradora cubre; la fianza legal (2 meses) sigue obligatoria y aparte.
- **Reservas**: tabla `bookings` (status `pending|confirmed|declined|canceled`, checkin/checkout, guests).
- **Valoraciones**: tabla `reviews` con `kind` `to_owner|to_renter`. Criterios: `servicio, comunicacion, entorno` (dueño) / `actitud` (inquilino). Solo tras checkout confirmado, ventana 30 días (`reviewWindow`), se anima en las 24h.
- **Orden de búsqueda**: `/buscar` ordena por defecto "destacados" = mejor puntuadas primero (`nulls last`).
- **Chat**: 1 conversación por (piso, inquilino); mensajes texto + imagen comprimida en cliente (data URL, tope ~260KB); polling 3s; `readAt` al abrir.
- **Favoritos**: toggle `POST /api/favoritos` → `{ favorited }`; corazones en cards/ficha; página `/favoritos`.
- **SuperAdmin**: `requireSuperAdmin()` (rol `superadmin` en Clerk); `/admin/gestiones` ve todas las reservas/contactos/chats; `/admin/informes` contabilidad + CSV; `/duenos/informes` ocupación/ganancias del dueño + CSV (`/api/reports/*`).
- **i18n ES/EN**: diccionarios en `modules/i18n/dictionaries.ts`, cookie `casaraiz-lang` (1 año), `useI18n()` en cliente y `getDict()` en servidor. Selector en header. Las rutas NO llevan prefijo de idioma (SEO: todo canónico en español + `lang` del html según cookie).

## 6. Variables de entorno (ver `.env.example`)

`DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`, `R2_*`, `ADMIN_EMAILS`, `NEXT_PUBLIC_SITE_URL`, `BREVO_API_KEY`, `BREVO_SENDER`, `CRON_SECRET`, `GOOGLE_SITE_VERIFICATION`.

Notas:
- `STRIPE_PRICE_RENTER_MONTHLY` ya NO se usa (inquilinos gratis); queda en `.env.example` por compat.
- `RESEND_API_KEY` y `NEXT_PUBLIC_MAPBOX_TOKEN` son obsoletas (se usa Brevo y OSM/Leaflet).
- **Jamás** pongas secretos en archivos del repo; solo en `.env.local` (gitignored). Las claves reales están en Vercel env.

## 7. Colores / tema

Paleta en `app/globals.css` (`@theme`): **azul mar** (`--color-mar-*`, `#062640`–`#eff6fb`) y **naranja otoño** (`--color-otono-*`, acento `#bc5f1a`). Fondo `#f2f7fb`. No usar "coral" (desapareció). Logo: `public/logo.png` (header, con transparencia) + `app/icon.png` (favicon, recorte cuadrado). Hero: `public/hero.avif` (+ `hero.webp` fallback) con efecto Ken Burns **solo en desktop** (`.kenburns` en globals.css, respeta `prefers-reduced-motion`). Navbar sticky con buscador compacto al hacer scroll (segunda fila en móvil).

## 8. Verificación de cambios

Siempre, antes de terminar:
```bash
npm run lint && npx tsc --noEmit && npm run build
```
Y si toqué schema: `npm run db:generate && npm run db:migrate` (con `.env.local` cargado).

## 9. Estado actual / pendientes

**Hecho**: MVP completo y en producción (`casaraizalquiler.com`, DNS propagado) — búsqueda temporal (fechas+huéspedes), categorías por entorno, mapa, publicar/editar con NRA obligatorio, reservas, valoraciones bidireccionales, verificación de identidad, chat con imágenes, favoritos, garantía opcional (ruta A), panel admin (usuarios, gestiones, suscripciones, tarifas por tramos, garantía, documentos, informes) + panel dueño (mis pisos, informes), tarifas por tramos, recordatorio 24h (cron + Brevo real), i18n ES/EN, navbar sticky con buscador compacto, hero AVIF + pass de rendimiento (next.config, leaflet solo en /mapa, /buscar a 24 + skeleton), SEO (sitemap, robots, JSON-LD, ciudades programáticas, /comparativa), CI (GitHub Actions), logo PNG.

**Pendientes conocidos**:
1. **Fotos reales**: subida usa `/api/upload` con presigned R2, pero R2 no está activado (devuelve 503 → el formulario acepta URLs manuales). Los seeds usan `picsum.photos`.
2. **Webhook Stripe**: `STRIPE_WEBHOOK_SECRET` no configurado en prod; `/membresia/ok` sincroniza sin webhook.
3. **CRON_SECRET** sin configurar (endpoint `/api/cron/review-reminders` responde 200 sin secret).
4. **Dominio en Clerk/Stripe**: añadir `casaraizalquiler.com` en Clerk (Domains) y Stripe settings.
5. **Calendario noche a noche**: las fechas filtran por ventana del dueño (`disponibleDesde/Hasta`), no hay calendario de reservas por día.
6. **Geocoding** vía Nominatim (gratis, sin API key), limitado a España.

## 10. Convenciones rápidas

- Rutas en español para SEO: `/alquiler-sin-comision/valencia/[barrio]`, `/buscar`, `/publicar`, `/precios`, `/reservas`, `/mi-cuenta`.
- IDs de usuario: Clerk `userId` → `users.clerkId` único; `users.id` (uuid) es FK interna.
- `auth()` es async (Clerk v7): `const { userId } = await auth()`.
- Server actions en `modules/*/actions.ts` con `"use server"`.
- `logAudit(...)` para cualquier acción sensible (ver tipos en `modules/audit/log.ts`).
- Deploy: `git push` a `origin` (público) y `privado`, luego `npx vercel --prod`.
