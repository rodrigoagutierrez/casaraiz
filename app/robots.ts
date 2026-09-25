import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/mi-cuenta", "/reservas", "/chat", "/duenos", "/membresia", "/sign-in", "/sign-up"],
      },
    ],
    sitemap: "https://casaraizalquiler.com/sitemap.xml",
  };
}
