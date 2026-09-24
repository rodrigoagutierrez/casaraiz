import Link from "next/link";
import { requireAdmin } from "@/modules/auth/guard";

const NAV = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/suscripciones", label: "Suscripciones" },
  { href: "/admin/precios", label: "Precios" },
  { href: "/admin/tarifas", label: "Tarifas" },
  { href: "/admin/documentos", label: "Documentos" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-mar-950">
          Admin <span className="text-otono-600">CasaRaiz</span>
        </h1>
        <nav className="flex flex-wrap gap-2">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full border border-mar-200 bg-white px-4 py-1.5 text-sm font-medium text-mar-900 hover:bg-mar-50"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
