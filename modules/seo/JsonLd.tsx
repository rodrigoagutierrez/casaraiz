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
    logo: "https://casaraizalquiler.com/logo.png",
    sameAs: [],
    description: "Marketplace de alquiler temporal en Valencia sin comisiones.",
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CasaRaiz",
    url: "https://casaraizalquiler.com",
    description: "Alquiler temporal directo entre dueños e inquilinos, sin comisiones.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://casaraizalquiler.com/buscar?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
