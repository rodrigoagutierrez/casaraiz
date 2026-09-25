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
