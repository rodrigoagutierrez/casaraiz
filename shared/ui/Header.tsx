"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import AdminLink from "@/modules/auth/components/AdminLink";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-mar-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="text-xl font-bold text-mar-900">
          Casa<span className="text-coral-500">Raiz</span>
        </Link>

        <Link
          href="/buscar"
          className="hidden items-center gap-2 rounded-full border border-mar-200 bg-white px-5 py-2 text-sm text-mar-950/70 shadow-sm hover:shadow-md md:flex"
        >
          <span className="font-medium text-mar-900">España</span>
          <span className="text-mar-200">|</span>
          <span>Barrio</span>
          <span className="text-mar-200">|</span>
          <span>Habs.</span>
          <span className="rounded-full bg-coral-500 p-1.5 text-white">⌕</span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link href="/buscar" className="hidden font-medium text-mar-900 sm:inline">Buscar</Link>
          <Link href="/mapa" className="hidden font-medium text-mar-900 sm:inline">Mapa</Link>
          <Link href="/publicar" className="hidden font-medium text-mar-900 sm:inline">Pon tu piso</Link>
          <Link href="/precios" className="hidden font-medium text-coral-600 sm:inline">Precios</Link>
          <Show when="signed-in">
            <Link href="/duenos" className="hidden font-medium text-mar-900 sm:inline">Mis pisos</Link>
            <Link href="/mi-cuenta" className="hidden font-medium text-mar-900 sm:inline">Mi cuenta</Link>
          </Show>
          <AdminLink />
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="font-medium text-mar-700">Entrar</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-full bg-coral-500 px-4 py-1.5 font-medium text-white hover:bg-coral-600">
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
