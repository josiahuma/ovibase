// ovibase/app/app/layout.tsx
import Link from "next/link";
import { requireTenant } from "@/src/lib/guards";
import { isAdminRole } from "@/src/lib/admin";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant, role } = await requireTenant();
  const isAdmin = isAdminRole(role);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-[260px] border-r border-slate-200 bg-slate-50 min-h-screen flex flex-col">
          <div className="p-5 border-b border-slate-200">
            <div className="text-xl font-bold tracking-tight">OviBase</div>
            <div className="text-xs text-slate-500 mt-1">
              {tenant.name} <span className="text-slate-400">({tenant.slug})</span>
            </div>
          </div>

          <nav className="p-3 space-y-1 text-sm">
            <NavLink href="/app" label="Dashboard" />
            <NavLink href="/app/members" label="Members" />
            <NavLink href="/app/leaders" label="Leaders" />
            <NavLink href="/app/attendance" label="Attendance" />
            <NavLink href="/app/finance" label="Finance" />

            {isAdmin ? (
              <div className="pt-3 mt-3 border-t border-slate-200">
                <div className="px-3 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Admin
                </div>
                <NavLink href="/app/settings" label="⚙️ Admin Settings" />
              </div>
            ) : null}
          </nav>

          <div className="mt-auto p-3 border-t border-slate-200">
            <form action="/api/auth/logout" method="post">
              <button className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Logout
              </button>
            </form>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-slate-200">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Workspace: <span className="text-slate-900">{tenant.name}</span>
              </div>
              <div className="text-xs text-slate-500">ovibase.com</div>
            </div>
          </header>

          <div className="p-6 bg-white min-h-screen">{children}</div>
        </main>
      </div>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-200 border border-transparent hover:border-slate-300"
    >
      {label}
    </Link>
  );
}
