import { db } from "@/shared/db/client";
import { subscriptions, users } from "@/shared/db/schema";
import { desc, ilike, or } from "drizzle-orm";
import Link from "next/link";
import { UserRowButtons } from "@/modules/admin/components/UserRowButtons";

export default async function AdminUsuarios({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      dniVerified: users.dniVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(q ? or(ilike(users.email, `%${q}%`)) : undefined)
    .orderBy(desc(users.createdAt))
    .limit(100);

  const subs = await db.select().from(subscriptions);
  const subByUser = new Map(subs.map((s) => [s.userId, s]));

  return (
    <div>
      <form method="GET" className="flex max-w-md gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por email..."
          className="flex-1 rounded-lg border border-mar-200 bg-white px-4 py-2 text-sm outline-none focus:border-mar-600"
        />
        <button className="rounded-full bg-mar-900 px-5 py-2 text-sm text-white hover:bg-mar-800">Buscar</button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-mar-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-mar-100 text-left text-mar-950/55">
              <th className="p-3">Email</th>
              <th className="p-3">Rol</th>
              <th className="p-3">DNI</th>
              <th className="p-3">Membresía</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => {
              const s = subByUser.get(u.id);
              return (
                <tr key={u.id} className="border-b border-mar-50 last:border-0">
                  <td className="p-3 font-medium text-mar-900">
                    <Link href={`/admin/usuarios/${u.id}`} className="underline">{u.email}</Link>
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${u.role === "owner" ? "bg-mar-100 text-mar-800" : "bg-coral-100 text-coral-700"}`}>
                      {u.role === "owner" ? "Dueño" : "Inquilino"}
                    </span>
                  </td>
                  <td className="p-3">{u.dniVerified ? "✓" : "—"}</td>
                  <td className="p-3 text-mar-950/65">{s ? `${s.plan} · ${s.status}` : "—"}</td>
                  <td className="p-3"><UserRowButtons id={u.id} role={u.role} dni={u.dniVerified} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-4 text-sm text-mar-950/55">Sin usuarios.</p>}
      </div>
    </div>
  );
}
