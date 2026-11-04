export type Locale = "es" | "en";

export const es = {  // Header / nav
  "nav.buscar": "Buscar",
  "nav.mapa": "Mapa",
  "nav.publicar": "Pon tu piso",
  "nav.precios": "Precios",
  "nav.entrar": "Entrar",
  "nav.crear": "Crear cuenta",
  "nav.misPisos": "Mis pisos",
  "nav.miCuenta": "Mi cuenta",
  "nav.reservas": "Reservas",
  "nav.mensajes": "Mensajes",
  "nav.favoritos": "Favoritos",
  "nav.admin": "Admin",

  // Hero
  "hero.titulo": "Encuentra tu alquiler temporal",
  "hero.subtitulo": "Sin intermediarios, sin comisiones",

  // Search
  "search.lugar": "Lugar",
  "search.lugarPlaceholder": "Busca tu alquiler",
  "search.fechas": "Check-in / Check-out",
  "search.huespedes": "Huéspedes",
  "search.cuantos": "¿Cuántos?",
  "search.buscar": "Buscar",

  // Categorías
  "cat.todos": "Todos",
  "cat.playa": "Playa",
  "cat.montana": "Montaña",
  "cat.bosque": "Bosque",
  "cat.ciudad": "Ciudad",
  "cat.rio": "Río",
  "cat.mapa": "Mapa",
  "cat.filtros": "Filtros",

  // Home secciones
  "home.destacados": "Destacados esta semana",
  "home.verTodos": "Ver todos",
  "home.destinos": "Destinos populares",
  "home.alquilerDirecto": "Alquiler directo",
  "home.barrios": "Explora por barrio en Valencia",
  "home.verBarrios": "Ver los {n} barrios →",
  "home.como": "Cómo funciona",
  "home.como1t": "1. Crea tu cuenta",
  "home.como1d": "Gratis, como inquilino o dueño. Verifica tu identidad.",
  "home.como2t": "2. Dueños activan su plan",
  "home.como2d": "Por tramos según tus pisos. Sin permanencia ni letra pequeña.",
  "home.como3t": "3. Contacta directo",
  "home.como3d": "Inquilinos gratis: habla con el dueño, visita y firma. Cero comisiones.",
  "home.planesTitulo": "Una membresía, cero comisiones",
  "home.planesTexto": "Inquilinos gratis · Dueños desde 19€/mes. Lo que pagas es lo que cuesta.",
  "home.verPlanes": "Ver planes",
  "home.publicarCta": "Publicar mi piso",

  // Propietarios landing
  "propietarios.titulo": "Publica tu piso sin comisión",
  "propietarios.subtitulo": "Inquilinos gratis, dueños pagan membresía. Sin comisiones de intermediación.",
  "propietarios.cta": "Publicar mi piso",
  "propietarios.beneficio1.t": "Sin comisiones por alquiler",
  "propietarios.beneficio1.d": "Conectas directo con el inquilino. Tú pones el precio, tú cobras el alquiler.",
  "propietarios.beneficio2.t": "Planes por tramos",
  "propietarios.beneficio2.d": "Desde 19€/mes para hasta 3 pisos. Plan anual desde 149€/año para hasta 15 pisos.",
  "propietarios.beneficio3.t": "Registro NRA y verificación",
  "propietarios.beneficio3.d": "Te ayudamos con el Registro Único de Arrendamientos (RD 1312/2024) y verificación de identidad.",
  "propietarios.pasos.t": "Cómo funciona para propietarios",
  "propietarios.pasos.1.t": "1. Regístrate",
  "propietarios.pasos.1.d": "Crea tu cuenta de propietario y verifica tu identidad.",
  "propietarios.pasos.2.t": "2. Elige tu plan",
  "propietarios.pasos.2.d": "Suscríbete por tramos según el número de pisos que publiques.",
  "propietarios.pasos.3.t": "3. Publica y contacta",
  "propietarios.pasos.3.d": "Sube tus fotos, publica y recibe contactos de inquilinos verificados.",

  // Footer
  "footer.propietarios": "Propietarios",
  "footer.inquilinos": "Inquilinos",
  "footer.ponPiso": "Pon tu piso",
  "footer.planes": "Planes y precios",
  "footer.buscar": "Buscar piso",
  "footer.casaRaiz": "CasaRaiz",
  "footer.comoFunciona": "Cómo funciona",
  "footer.legal": "Legal España",
  "footer.terminos": "Términos y condiciones",
  "footer.privacidad": "Privacidad (RGPD)",
  "footer.conformidad": "Conformidad anunciante",
  "footer.copy": "© CasaRaiz — alquiler directo sin comisiones",

  // Idioma
  "lang.es": "Español",
  "lang.en": "English",
  "lang.label": "Idioma",
} as const;

export type Dict = Record<keyof typeof es, string>;

export const en: Dict = {
  // Header / nav
  "nav.buscar": "Search",
  "nav.mapa": "Map",
  "nav.publicar": "List your home",
  "nav.precios": "Pricing",
  "nav.entrar": "Sign in",
  "nav.crear": "Sign up",
  "nav.misPisos": "My homes",
  "nav.miCuenta": "My account",
  "nav.reservas": "Bookings",
  "nav.mensajes": "Messages",
  "nav.favoritos": "Saved",
  "nav.admin": "Admin",

  // Hero
  "hero.titulo": "Find your short-term rental",
  "hero.subtitulo": "No middlemen, no commissions",

  // Search
  "search.lugar": "Location",
  "search.lugarPlaceholder": "Search your stay",
  "search.fechas": "Check-in / Check-out",
  "search.huespedes": "Guests",
  "search.cuantos": "How many?",
  "search.buscar": "Search",

  // Categorías
  "cat.todos": "All",
  "cat.playa": "Beach",
  "cat.montana": "Mountain",
  "cat.bosque": "Forest",
  "cat.ciudad": "City",
  "cat.rio": "River",
  "cat.mapa": "Map",
  "cat.filtros": "Filters",

  // Home secciones
  "home.destacados": "Featured this week",
  "home.verTodos": "See all",
  "home.destinos": "Popular destinations",
  "home.alquilerDirecto": "Direct rental",
  "home.barrios": "Explore by neighbourhood in Valencia",
  "home.verBarrios": "See all {n} neighbourhoods →",
  "home.como": "How it works",
  "home.como1t": "1. Create your account",
  "home.como1d": "Free, as tenant or owner. Verify your identity.",
  "home.como2t": "2. Owners activate a plan",
  "home.como2d": "Tiered pricing by number of homes. No lock-in.",
  "home.como3t": "3. Contact directly",
  "home.como3d": "Tenants for free: talk to the owner, visit and sign. Zero commissions.",
  "home.planesTitulo": "One membership, zero commissions",
  "home.planesTexto": "Tenants free · Owners from 19€/month. You pay what it costs.",
  "home.verPlanes": "See plans",
  "home.publicarCta": "List my home",

  // Propietarios landing
  "propietarios.titulo": "List your home without commissions",
  "propietarios.subtitulo": "Tenants free, owners pay membership. No intermediary commissions.",
  "propietarios.cta": "List my home",
  "propietarios.beneficio1.t": "No commissions on rentals",
  "propietarios.beneficio1.d": "Connect directly with the tenant. You set the price, you collect the rent.",
  "propietarios.beneficio2.t": "Tiered pricing",
  "propietarios.beneficio2.d": "From 19€/month for up to 3 homes. Annual plan from 149€/year for up to 15 homes.",
  "propietarios.beneficio3.t": "NRA registration and verification",
  "propietarios.beneficio3.d": "We help with the Unique Rental Register (RD 1312/2024) and identity verification.",
  "propietarios.pasos.t": "How it works for owners",
  "propietarios.pasos.1.t": "1. Register",
  "propietarios.pasos.1.d": "Create your owner account and verify your identity.",
  "propietarios.pasos.2.t": "2. Choose your plan",
  "propietarios.pasos.2.d": "Subscribe by tier based on how many homes you list.",
  "propietarios.pasos.3.t": "3. List and connect",
  "propietarios.pasos.3.d": "Upload your photos, list, and receive contacts from verified tenants.",

  // Footer
  "footer.propietarios": "Owners",
  "footer.inquilinos": "Tenants",
  "footer.ponPiso": "List your home",
  "footer.planes": "Plans and pricing",
  "footer.buscar": "Find a home",
  "footer.casaRaiz": "CasaRaiz",
  "footer.comoFunciona": "How it works",
  "footer.legal": "Legal (Spain)",
  "footer.terminos": "Terms and conditions",
  "footer.privacidad": "Privacy (GDPR)",
  "footer.conformidad": "Advertiser compliance",
  "footer.copy": "© CasaRaiz — direct rental, no commissions",

  // Idioma
  "lang.es": "Español",
  "lang.en": "English",
  "lang.label": "Language",
};

export const dictionaries: Record<Locale, Dict> = { es, en };
