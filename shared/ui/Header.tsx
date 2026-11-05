"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import AdminLink from "@/modules/auth/components/AdminLink";
import LanguageSwitcher from "@/modules/i18n/components/LanguageSwitcher";
import CompactSearch from "@/modules/properties/components/CompactSearch";
import { useI18n } from "@/modules/i18n/provider";

// Icono de 16px para los enlaces del menú del avatar (stroke = currentColor).
function NavIcon({ d }: { d: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function Header() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [city, setCity] = useState("");
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 160);
        ticking.current = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-white/90 backdrop-blur transition-all duration-300 ${
        scrolled ? "border-mar-100 shadow-sm" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <Link href="/" aria-label="CasaRaiz" className="flex shrink-0 items-center">
          <Image src="/logo.png" alt="CasaRaiz" width={769} height={614} className="h-auto w-24 sm:w-32" />
        </Link>

        <nav className="flex shrink-0 items-center gap-2 text-sm sm:gap-3">
          <Link href="/buscar" className={`font-medium text-mar-900 ${scrolled ? "hidden" : "hidden md:inline"}`}>{t["nav.buscar"]}</Link>
          <Link href="/mapa" className={`font-medium text-mar-900 ${scrolled ? "hidden" : "hidden lg:inline"}`}>{t["nav.mapa"]}</Link>
          <Link href="/propietarios" className="hidden font-medium text-mar-900 lg:inline">{t["nav.publicar"]}</Link>
          <Link href="/precios" className="hidden font-medium text-otono-700 md:inline">{t["nav.precios"]}</Link>
          <Show when="signed-in">
            <Link href="/reservas" className="hidden font-medium text-mar-900 lg:inline">{t["nav.reservas"]}</Link>
            <Link href="/chat" className="hidden font-medium text-mar-900 lg:inline">{t["nav.mensajes"]}</Link>
            <Link href="/favoritos" className="hidden font-medium text-mar-900 lg:inline">{t["nav.favoritos"]}</Link>
            <Link href="/duenos" className="hidden font-medium text-mar-900 lg:inline">{t["nav.misPisos"]}</Link>
            <Link href="/mi-cuenta" className="hidden font-medium text-mar-900 lg:inline">{t["nav.miCuenta"]}</Link>
          </Show>
          <AdminLink />
          <LanguageSwitcher />
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="font-medium text-mar-700">{t["nav.entrar"]}</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-full bg-otono-600 px-4 py-1.5 font-medium text-white hover:bg-otono-700">
                {t["nav.crear"]}
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton>
              {/* Atajos siempre visibles (también en móvil, donde la nav está oculta). */}
              <UserButton.MenuItems>
                <UserButton.Link href="/reservas" label={t["nav.reservas"]} labelIcon={<NavIcon d="M3 4.5h10v9H3zM3 7.5h10M6.5 2.5v4M9.5 2.5v4" />} />
                <UserButton.Link href="/chat" label={t["nav.mensajes"]} labelIcon={<NavIcon d="M2.5 4h11v7h-6l-3.5 2.5V11h-1.5z" />} />
                <UserButton.Link href="/favoritos" label={t["nav.favoritos"]} labelIcon={<NavIcon d="M8 13.5S2.5 10.5 2.5 6.5A2.9 2.9 0 0 1 8 5a2.9 2.9 0 0 1 5.5 1.5c0 4-5.5 7-5.5 7z" />} />
                <UserButton.Link href="/mi-cuenta" label={t["nav.miCuenta"]} labelIcon={<NavIcon d="M8 8a2.75 2.75 0 1 0 0-5.5A2.75 2.75 0 0 0 8 8zm-5 5.5c0-2.2 2.2-3.5 5-3.5s5 1.3 5 3.5" />} />
              </UserButton.MenuItems>
            </UserButton>
          </Show>
        </nav>
      </div>
      {/* Buscador: fila propia bajo el menú (no se junta con la nav). */}
      <div
        className={`overflow-hidden border-t transition-all duration-300 ${
          scrolled ? "max-h-24 border-mar-100 opacity-100" : "max-h-0 border-transparent opacity-0"
        }`}
        aria-hidden={!scrolled}
      >
        <div className="mx-auto max-w-6xl px-4 py-2.5 sm:px-6" inert={!scrolled ? true : undefined}>
          <CompactSearch visible={scrolled} idSuffix="bar" city={city} setCity={setCity} />
        </div>
      </div>
    </header>
  );
}
