import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/modules/notifications/email";
import { clientIp, rateLimit, tooManyRequests } from "@/shared/lib/rateLimit";

const waitlistSchema = z.object({
  email: z.string().email().max(200),
  ciudad: z.string().trim().min(2).max(80),
  tipo: z.enum(["inquilino", "dueno", "ambos"]),
  // Honeypot anti-spam: si un bot lo rellena, lo ignoramos en silencio.
  empresa: z.string().max(200).optional(),
});

async function upsertBrevoContact(key: string, email: string, attrs: Record<string, string>) {
  const doFetch = (body: Record<string, unknown>) =>
    fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: { "api-key": key, "content-type": "application/json" },
      body: JSON.stringify(body),
    });

  // 1) Con atributos (si los campos personalizados no existen en Brevo, la API responde 400)
  let res = await doFetch({ email, attributes: attrs, updateEnabled: true });
  if (!res.ok) {
    // 2) Reintento solo con el email (el aviso por correo lleva el detalle completo)
    res = await doFetch({ email, updateEnabled: true });
    if (!res.ok) console.error("[waitlist] brevo error", res.status, await res.text());
    return res.ok;
  }
  return true;
}

// POST /api/waitlist { email, ciudad, tipo } -> { ok }
// Alta en lista de espera: contacto en Brevo + aviso por email al equipo. Sin login.
// Anti-abuso (SOC2 A1.1): endpoint público y sin auth → 5 altas/hora y máx 20/día por IP.
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rlHour = rateLimit(`waitlist:h:${ip}`, 5, 60 * 60 * 1000);
  if (!rlHour.ok) return tooManyRequests(rlHour.retryAfterSec);
  const rlDay = rateLimit(`waitlist:d:${ip}`, 20, 24 * 60 * 60 * 1000);
  if (!rlDay.ok) return tooManyRequests(rlDay.retryAfterSec);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "DATOS_INVALIDOS" }, { status: 400 });
  }

  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "DATOS_INVALIDOS" }, { status: 400 });

  const { email, ciudad, tipo, empresa } = parsed.data;
  if (empresa) return NextResponse.json({ ok: true }); // honeypot: bot, no persistir

  const key = process.env.BREVO_API_KEY;
  if (key) {
    await upsertBrevoContact(key, email, {
      CIUDAD: ciudad,
      TIPO_USUARIO: tipo,
      FUENTE: "lista-espera",
    });
  } else {
    console.log(`[waitlist:stub] ${email} · ${ciudad} · ${tipo}`);
  }

  await sendEmail(
    "hola@casaraizalquiler.com",
    `Lista de espera: ${ciudad} (${tipo})`,
    `Nuevo alta en la lista de espera:\n\nEmail: ${email}\nCiudad: ${ciudad}\nTipo: ${tipo === "dueno" ? "Dueño" : tipo === "inquilino" ? "Inquilino" : "Ambos"}\n`
  );

  return NextResponse.json({ ok: true }, { status: 201 });
}
