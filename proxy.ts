import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (_auth, req) => {
  const nonce = btoa(crypto.randomUUID());
  const isDev = process.env.NODE_ENV === "development";
  const r2Connect = process.env.R2_ACCOUNT_ID
    ? ` https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : "";

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://clerk.casaraizalquiler.com https://*.clerk.accounts.dev https://*.client.protect.clerk.com${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://img.clerk.com https://picsum.photos https://*.r2.dev https://tile.openstreetmap.org",
    "font-src 'self' data:",
    `connect-src 'self' https://clerk.casaraizalquiler.com https://*.clerk.accounts.dev https://clerk-telemetry.com${r2Connect}`,
    "frame-src 'self' https://www.openstreetmap.org https://clerk.casaraizalquiler.com https://*.clerk.accounts.dev",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "worker-src 'self' blob:",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  res.headers.set("Content-Security-Policy", csp);

  return res;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
