export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CasaRaiz",
    url: "https://casaraizalquiler.com",
    logo: "https://casaraizalquiler.com/logo.jpg",
    sameAs: [],
    description: "Marketplace de alquiler temporal en España sin comisiones.",
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CasaRaiz",
    url: "https://casaraizalquiler.com",
    description: "Alquiler temporal directo entre dueños e inquilinos, sin comisiones.",
  };
}
