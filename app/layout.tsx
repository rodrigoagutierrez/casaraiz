import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/shared/ui/Header";
import Footer from "@/shared/ui/Footer";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CasaRaiz | Alquiler sin comisión en Valencia",
  description: "Conectamos dueños e inquilinos sin comisiones. Paga una membresía y alquila directo en Valencia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-mar-50">
        <ClerkProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}