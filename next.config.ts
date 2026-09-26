import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "*.r2.dev" },
    ],
  },
  experimental: {
    optimizePackageImports: ["@clerk/nextjs", "leaflet"],
  },
  async headers() {
    return [
      {
        source: "/:file(hero|logo).(avif|webp|jpg)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
