"use client";

import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import AdminLink from "@/modules/auth/components/AdminLink";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-mar-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-mar-900">
          <Image src="/logo-mark.svg" alt="CasaRaiz" width={40} height={40} className="h-10 w-10" priority />
          <span>Casa<span className="text-otono-600">Raiz</span></span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link href="/buscar" className="hidden font-medium text-mar-900 sm:inline">Buscar</Link>
          <Link href="/mapa" className="hidden font-medium text-mar-900 sm:inline">Mapa</Link>
          <Link href="/publicar" className="hidden font-medium text-mar-900 sm:inline">Pon tu piso</Link>
          <Link href="/precios" className="hidden font-medium text-otono-700 sm:inline">Precios</Link>
          <Show when="signed-in">
            <Link href="/reservas" className="hidden font-medium text-mar-900 sm:inline">Reservas</Link>
            <Link href="/duenos" className="hidden font-medium text-mar-900 sm:inline">Mis pisos</Link>
            <Link href="/mi-cuenta" className="hidden font-medium text-mar-900 sm:inline">Mi cuenta</Link>
          </Show>
          <AdminLink />
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="font-medium text-mar-700">Entrar</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-full bg-otono-600 px-4 py-1.5 font-medium text-white hover:bg-otono-700">
                Crear cuenta
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </nav>
      </div>
    </header>
  );
}
