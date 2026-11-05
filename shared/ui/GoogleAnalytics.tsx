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
          gtag('js', new Date());
          gtag('config', '${measurementId}', { page_path: window.location.pathname });
        `}
      </Script>
    </>
  );
}
