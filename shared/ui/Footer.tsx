import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-mar-100 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-10 text-sm md:grid-cols-4">
        <div>
          <p className="font-semibold text-mar-900">Propietarios</p>
          <ul className="mt-3 space-y-2 text-mar-950/65">
            <li><Link href="/publicar" className="hover:underline">Pon tu piso</Link></li>
            <li><Link href="/precios" className="hover:underline">Planes y precios</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-mar-900">Inquilinos</p>
          <ul className="mt-3 space-y-2 text-mar-950/65">
            <li><Link href="/buscar" className="hover:underline">Buscar piso</Link></li>
            <li><Link href="/alquiler-sin-comision/valencia/ruzafa" className="hover:underline">Ruzafa</Link></li>
            <li><Link href="/alquiler-sin-comision/valencia/benimaclet" className="hover:underline">Benimaclet</Link></li>
            <li><Link href="/alquiler-sin-comision/valencia/el-cabanyal" className="hover:underline">El Cabanyal</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-mar-900">CasaRaiz</p>
          <ul className="mt-3 space-y-2 text-mar-950/65">
            <li><Link href="/precios" className="hover:underline">Cómo funciona</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-mar-900">Legal España</p>
          <ul className="mt-3 space-y-2 text-mar-950/65">
            <li><Link href="/legal/terminos" className="hover:underline">Términos y condiciones</Link></li>
            <li><Link href="/legal/privacidad" className="hover:underline">Privacidad (RGPD)</Link></li>
            <li><Link href="/legal/conformidad" className="hover:underline">Conformidad anunciante</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-mar-100 py-4 text-center text-xs text-mar-950/50">
        © CasaRaiz Valencia — alquiler directo sin comisiones
      </div>
    </footer>
  );
}
