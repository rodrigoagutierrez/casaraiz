"use client";

import Script from "next/script";

export default function GoogleAnalytics({
  measurementId,
  nonce,
}: {
  measurementId: string;
  nonce?: string;
}) {
  if (!measurementId) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        nonce={nonce}
      />
      {/* El nonce es obligatorio: la CSP (proxy.ts) bloquea inline scripts sin él. */}
      <Script id="google-analytics" strategy="afterInteractive" nonce={nonce}>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          // Consent Mode v2: denegado por defecto ANTES del config (art. 22.2
          // LSSI): sin consentimiento no se escriben cookies de medición.
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
          });
          // Si ya se aceptó en el banner (guardado en localStorage), se restaura
          // antes de arrancar la config para que las visitas previas cuenten.
          try {
            if (localStorage.getItem('casaraiz-consent') === 'granted') {
              gtag('consent', 'update', { analytics_storage: 'granted' });
            }
          } catch (e) {}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { page_path: window.location.pathname });
        `}
      </Script>
    </>
  );
}
