"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import AdminLink from "@/modules/auth/components/AdminLink";
import LanguageSwitcher from "@/modules/i18n/components/LanguageSwitcher";
import CompactSearch from "@/modules/properties/components/CompactSearch";
import { useI18n } from "@/modules/i18n/provider";

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
          <Image src="/logo.jpg" alt="CasaRaiz" width={96} height={52} className="h-auto w-24" />
        </Link>

        <div
          className={`hidden min-w-0 transition-all duration-300 md:block ${
            scrolled ? "flex-1 opacity-100" : "w-0 flex-none overflow-hidden opacity-0"
          }`}
        >
          <CompactSearch visible={scrolled} idSuffix="desk" city={city} setCity={setCity} />
        </div>

        <nav className="flex shrink-0 items-center gap-2 text-sm sm:gap-3">
          <Link href="/buscar" className={`font-medium text-mar-900 ${scrolled ? "hidden" : "hidden md:inline"}`}>{t["nav.buscar"]}</Link>
          <Link href="/mapa" className={`font-medium text-mar-900 ${scrolled ? "hidden" : "hidden lg:inline"}`}>{t["nav.mapa"]}</Link>
          <Link href="/publicar" className="hidden font-medium text-mar-900 lg:inline">{t["nav.publicar"]}</Link>
          <Link href="/precios" className="hidden font-medium text-otono-700 md:inline">{t["nav.precios"]}</Link>
          <Show when="signed-in">
            <Link href="/reservas" className="hidden font-medium text-mar-900 lg:inline">{t["nav.reservas"]}</Link>
            <Link href="/chat" className="hidden font-medium text-mar-900 lg:inline">{t["nav.mensajes"]}</Link>
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
            <UserButton />
          </Show>
        </nav>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 md:hidden ${
          scrolled ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!scrolled}
      >
        <div className="px-4 pb-3" inert={!scrolled ? true : undefined}>
          <CompactSearch visible={scrolled} idSuffix="mob" city={city} setCity={setCity} />
        </div>
      </div>
    </header>
  );
}
