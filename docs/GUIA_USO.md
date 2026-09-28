# Guía de uso — CasaRaiz

CasaRaiz conecta **dueños** e **inquilinos** para alquiler temporal en España, sin comisiones. Hay tres perfiles: **inquilino**, **dueño** y **administrador**.

---

## 1. Inquilino (buscar y reservar)

1. **Crea tu cuenta** (botón "Crear cuenta" del header). Es gratis.
2. **Verifica tu identidad** en `/mi-cuenta`: sube DNI/NIE o pasaporte (anverso y reverso). El equipo lo aprueba en 24–48 h.
3. **Busca**:
   - En la home, usa el buscador: lugar, fechas de check-in/check-out y huéspedes.
   - Filtra por **entorno** (Playa, Montaña, Bosque, Ciudad, Río), precio, habitaciones, etc.
   - Explora el **mapa** (`/mapa`).
4. **Abre un piso** (`/p/[slug]`): fotos, precio/noche, capacidad, valoraciones y disponibilidad. Toca el **corazón** para guardarlo en favoritos.
5. **Contacta** al dueño, **chatea** con él o **reserva** directamente. Al reservar puedes añadir la **Garantía CasaRaiz** (canon único, opcional).
6. **Tras tu estancia** (en las 24 h tras el check-out), valora al dueño: Servicio, Comunicación y Entorno (1–5 estrellas). Aparece en `/reservas`.
7. Tus guardados están en **Favoritos** (corazón del header o `/mi-cuenta`).

> No pagas comisión ni membresía. Solo necesitas cuenta verificada.

---

## 2. Dueño (publicar y alquilar)

1. **Crea tu cuenta** y **verifica tu identidad** (mismo proceso que el inquilino).
2. **Elige tu plan** en `/precios`. El plan mensual se cobra por **tramos** según tus pisos publicados (p. ej. 1–3 pisos, 4–10 pisos). El anual es un precio fijo con más capacidad.
3. **Publica un piso** en `/publicar` (o desde `/duenos`):
    - Título, descripción, precio/noche, habitaciones, baños, m².
    - **Nº de Registro Único obligatorio** (RD 1312/2024) + modalidad (temporada/VUT). Sin número, el anuncio queda como borrador.
    - **Huéspedes máximos** y **ventana disponible** (desde/hasta; vacío = siempre).
    - Ciudad, zona y **entorno** (Playa, Montaña, Bosque, Ciudad, Río) — así te encuentran por categoría.
    - Fotos (subida directa o pegar URL).
4. **Gestiona** en `/duenos`: edita, pausa (borrador) o marca como alquilado. Mira tus **informes** de ocupación y ganancias en `/duenos/informes` (con descarga CSV).
5. **Recibe reservas/contactos/chats** y acéptalos o recházalos en `/reservas` y `/chat`.
6. **Tras el check-out**, valora al inquilino (Actitud, 1–5 estrellas).

> Si tienes muchas propiedades, en `/precios` verás el bloque de contacto para un plan a medida.

---

## 3. Administrador (`/admin`)

Acceso solo para emails en `ADMIN_EMAILS` (el titular además tiene rol `superadmin` en Clerk). Secciones:

- **Panel** (`/admin`): métricas (usuarios, pisos, membresías, contactos).
- **Usuarios** (`/admin/usuarios`): busca por email, cambia rol, marca DNI, y entra en cada usuario para ver datos, suscripciones, métodos de pago, actividad e historial.
- **Gestiones** (`/admin/gestiones`, superadmin): todas las reservas, contactos y chats entre dueños e inquilinos.
- **Suscripciones** (`/admin/suscripciones`): ver, cancelar y **crear suscripciones manuales** u **ofertas de temporada** (con fecha de validez).
- **Informes** (`/admin/informes`): contabilidad de suscripciones y volumen de reservas, con descarga CSV.
- **Tarifas** (`/admin/tarifas`): define los **tramos de precio** (rango de pisos → €/mes) y la **leyenda** + **botón de contacto** que se ven en `/precios`.
- **Garantía** (`/admin/garantia`): configura el canon (%/mín/tope/texto) y ve las garantías contratadas.
- **Precios** (`/admin/precios`): ajusta el plan anual y su capacidad.
- **Documentos** (`/admin/documentos`): edita Términos, Privacidad (RGPD), Conformidad, Aviso legal, Cookies y Política de reseñas. Se publican en `/legal/*`.

### Verificación de identidad (admin)

En la ficha de un usuario (`/admin/usuarios/[id]`) puedes **aprobar o rechazar** su documento. Al aprobar, el usuario muestra el sello "verificado".

### Tarifas por tramos (ejemplo)

| Desde | Hasta | €/mes |
|-------|-------|-------|
| 1 | 3 | 19 € |
| 4 | 10 | 49 € |
| 11 | — | a consultar |

"Importe vacío" = "a consultar": el checkout pedirá contacto en vez de cobrar.

---

## Preguntas frecuentes

- **¿Hay comisión por alquilar?** No. Solo los dueños pagan membresía.
- **¿Fianza?** En alquiler de temporada (LAU), 2 mensualidades sobre la renta mensualizada (precio/noche × 30). La Garantía CasaRaiz es opcional y aparte.
- **¿Cómo se verifica la identidad?** Subes DNI/NIE o pasaporte (anverso + reverso); el equipo lo revisa.
- **¿Puedo ser dueño e inquilino a la vez?** Sí. En `/mi-cuenta` cambias de rol sin perder nada.
- **¿Cómo cancelo mi membresía?** En `/precios` → "Gestionar mi membresía" (portal de Stripe).
- **¿La web está en inglés?** Sí, con el selector ES/EN del header (las fichas y anuncios siguen en su idioma original).
