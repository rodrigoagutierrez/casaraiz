// Limitador de peticiones en memoria (ventana fija) — defensa anti-abuso
// (SOC2 A1.1/CC7.x) SIN dependencias externas. Alcance y límites honestos:
// - Estado por instancia de función serverless (Vercel): cada lambda maneja su
//   propio contador. Para un app pequeño esto disuade el abuso manual/scripted
//   básico; NO es un límite global exacto. Si algún día hace falta precisión,
//   migrar a Upstash Redis (@upstash/ratelimit) cambiando solo este fichero.
// - Claves: clerkId para endpoints autenticados, IP (x-forwarded-for) para
//   públicos. La IP puede ser compartida (CGNAT/ofi): límites generosos.
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Purga periódica para que el mapa no crezca sin límite.
const MAX_BUCKETS = 10_000;

export type RateLimitResult = { ok: boolean; retryAfterSec: number };

/**
 * Consume una petición de la ventana `windowMs` para la clave `key`.
 * `limit` = peticiones permitidas por ventana.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    // Purga oportunista si el mapa se ha inflado (attack o clock skew).
    if (buckets.size > MAX_BUCKETS) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  return { ok: true, retryAfterSec: 0 };
}

/** IP del cliente según los headers de Vercel/Next (primer salto de la cadena). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "desconocida";
}

/** Respuesta 429 estándar con cabeceras informativas. */
export function tooManyRequests(retryAfterSec: number): Response {
  return new Response(
    JSON.stringify({ error: "DEMASIADAS_PETICIONES" }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": String(retryAfterSec),
      },
    }
  );
}
