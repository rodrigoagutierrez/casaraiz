// Envío de email transaccional. Si no hay BREVO_API_KEY, registra en consola.
// Actívalo en producción añadiendo BREVO_API_KEY (Brevo / Sendinblue) y BREVO_SENDER.

export async function sendEmail(to: string, subject: string, text: string) {
  const key = process.env.BREVO_API_KEY;
  const sender = process.env.BREVO_SENDER ?? "hola@casaraizalquiler.com";

  if (!key) {
    console.log(`[email:stub] → ${to} | ${subject} | ${text.slice(0, 120)}`);
    return { sent: false, stub: true };
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": key,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: sender, name: "CasaRaiz" },
        to: [{ email: to }],
        subject,
        textContent: text,
      }),
    });
    if (!res.ok) {
      console.error("[email] brevo error", res.status, await res.text());
      return { sent: false };
    }
    return { sent: true };
  } catch (e) {
    console.error("[email] fail", e);
    return { sent: false };
  }
}
