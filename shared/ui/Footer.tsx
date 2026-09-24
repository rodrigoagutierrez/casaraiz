"use client";

import Link from "next/link";
import { useI18n } from "@/modules/i18n/provider";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 border-t border-mar-100 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-10 text-sm md:grid-cols-4">
        <div>
          <p className="font-semibold text-mar-900">{t["footer.propietarios"]}</p>
          <ul className="mt-3 space-y-2 text-mar-950/65">
            <li><Link href="/publicar" className="hover:underline">{t["footer.ponPiso"]}</Link></li>
            <li><Link href="/precios" className="hover:underline">{t["footer.planes"]}</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-mar-900">{t["footer.inquilinos"]}</p>
          <ul className="mt-3 space-y-2 text-mar-950/65">
            <li><Link href="/buscar" className="hover:underline">{t["footer.buscar"]}</Link></li>
            <li><Link href="/alquiler-sin-comision/valencia/ruzafa" className="hover:underline">Ruzafa</Link></li>
            <li><Link href="/alquiler-sin-comision/valencia/benimaclet" className="hover:underline">Benimaclet</Link></li>
            <li><Link href="/alquiler-sin-comision/valencia/el-cabanyal" className="hover:underline">El Cabanyal</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-mar-900">{t["footer.casaRaiz"]}</p>
          <ul className="mt-3 space-y-2 text-mar-950/65">
            <li><Link href="/precios" className="hover:underline">{t["footer.comoFunciona"]}</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-mar-900">{t["footer.legal"]}</p>
          <ul className="mt-3 space-y-2 text-mar-950/65">
            <li><Link href="/legal/terminos" className="hover:underline">{t["footer.terminos"]}</Link></li>
            <li><Link href="/legal/privacidad" className="hover:underline">{t["footer.privacidad"]}</Link></li>
            <li><Link href="/legal/conformidad" className="hover:underline">{t["footer.conformidad"]}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-mar-100 py-4 text-center text-xs text-mar-950/50">
        {t["footer.copy"]}
      </div>
    </footer>
  );
}
