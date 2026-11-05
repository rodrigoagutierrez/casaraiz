import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Header from "@/shared/ui/Header";
import Footer from "@/shared/ui/Footer";
import GoogleAnalytics from "@/shared/ui/GoogleAnalytics";
import { I18nProvider } from "@/modules/i18n/provider";
import { getLocale } from "@/modules/i18n/server";
import pkg from "../package.json";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://casaraizalquiler.com"),
  title: {
    default: "CasaRaiz | Alquiler temporal sin comisión en Valencia",
    template: "%s | CasaRaiz",
  },
  description:
    "Conectamos dueños e inquilinos para alquiler temporal en Valencia, sin comisiones. Inquilinos gratis, dueños con membresía mensual o anual.",
  keywords: ["alquiler temporal", "sin comisión", "dueños directos", "Valencia", "alquiler de temporada", "alternativa a Airbnb"],
  alternates: { canonical: "/" },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://casaraizalquiler.com",
    siteName: "CasaRaiz",
    title: "CasaRaiz | Alquiler temporal sin comisión",
    description: "Alquiler temporal directo entre dueños e inquilinos. Sin comisiones.",
    images: [{ url: "/hero.jpg", width: 1920, height: 1313, alt: "CasaRaiz" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CasaRaiz | Alquiler temporal sin comisión",
    description: "Dueños e inquilinos directos. Sin comisiones.",
    images: ["/hero.jpg"],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-mar-50">
        <ClerkProvider>
          <I18nProvider initialLang={locale}>
            <Header />
            <div className="flex-1">{children}</div>
            <Footer version={pkg.version} />
          </I18nProvider>
        </ClerkProvider>
      <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ""} />
      </body>
    </html>
  );
}