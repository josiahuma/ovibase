"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { UserRole } from "@prisma/client";

type Tenant = {
  id: string;
  name: string;
  slug: string;
};

type UserTenant = {
  role: UserRole;
  canMembers: boolean;
  canLeaders: boolean;
  canAttendance: boolean;
  canFinance: boolean;
  canSms: boolean;
};

export default function AppShell({
  children,
  tenant,
  ut,
  isAdmin,
}: {
  children: React.ReactNode;
  tenant: Tenant;
  ut: UserTenant;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);

  // lock body scroll when menu open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // close on route change via link click
  const close = () => setOpen(false);

  const links = [
    { href: "/app", label: "Dashboard", show: true },
    { href: "/app/members", label: "Members", show: isAdmin || ut.canMembers },
    { href: "/app/leaders", label: "Leaders", show: isAdmin || ut.canLeaders },
    { href: "/app/attendance", label: "Attendance", show: isAdmin || ut.canAttendance },
    { href: "/app/finance", label: "Finance", show: isAdmin || ut.canFinance },
   // { href: "/app/sms", label: "SMS", show: isAdmin || ut.canSms },
  ].filter((l) => l.show);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Mobile overlay */}
      {open && (
        <button
          aria-label="Close menu overlay"
          onClick={close}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex w-[260px] border-r border-slate-200 bg-slate-50 min-h-screen flex-col">
          <SidebarHeader tenant={tenant} />
          <SidebarNav links={links} isAdmin={isAdmin} onNavigate={close} />
          <SidebarFooter />
        </aside>

        {/* Mobile drawer */}
        <aside
          className={[
            "fixed md:hidden z-50 top-0 left-0 h-dvh w-[280px] bg-white border-r border-slate-200 shadow-xl",
            "transform transition-transform duration-200",
            open ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-slate-200 bg-white">
                <Image
                  src="/ob-logo.png"
                  alt="OviBase logo"
                  fill
                  className="object-contain p-1"
                  priority
                />
              </div>
              <div>
                <div className="text-sm font-semibold leading-tight">OviBase</div>
                <div className="text-[11px] text-slate-500 leading-tight">
                  {tenant.slug}
                </div>
              </div>
            </div>

            <button
              onClick={close}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white h-9 w-9 text-slate-700 hover:bg-slate-50"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <SidebarNav links={links} isAdmin={isAdmin} onNavigate={close} />
          <SidebarFooter />
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-slate-200">
            <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Hamburger (mobile) */}
                <button
                  onClick={() => setOpen(true)}
                  className="md:hidden inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white h-9 w-9 text-slate-700 hover:bg-slate-50"
                  aria-label="Open menu"
                >
                  ☰
                </button>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:block text-sm text-slate-500">
                    Workspace:{" "}
                    <span className="text-slate-900 font-medium">
                      {tenant.name}
                    </span>
                  </div>

                  {/* Small logo on desktop header */}
                  <div className="hidden md:flex items-center gap-2">
                    <div className="relative h-7 w-7 overflow-hidden rounded-md border border-slate-200 bg-white">
                      <Image
                        src="/ob-logo.png"
                        alt="OviBase logo"
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="text-xs text-slate-500">ovibase.com</div>
                  </div>
                </div>
              </div>

              <div className="md:hidden text-xs text-slate-500">
                {tenant.name}
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6 bg-white min-h-screen">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarHeader({ tenant }: { tenant: Tenant }) {
  return (
    <div className="p-5 border-b border-slate-200 bg-slate-50">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <Image
            src="/ob-logo.png"
            alt="OviBase logo"
            fill
            className="object-contain p-1.5"
            priority
          />
        </div>
        <div>
          <div className="text-lg font-bold tracking-tight">OviBase</div>
          <div className="text-xs text-slate-500 mt-0.5">
            {tenant.name}{" "}
            <span className="text-slate-400">({tenant.slug})</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarNav({
  links,
  isAdmin,
  onNavigate,
}: {
  links: { href: string; label: string }[];
  isAdmin: boolean;
  onNavigate: () => void;
}) {
  return (
    <nav className="p-3 space-y-1 text-sm bg-white md:bg-slate-50">
      {links.map((l) => (
        <NavLink key={l.href} href={l.href} label={l.label} onNavigate={onNavigate} />
      ))}

      {isAdmin ? (
        <div className="pt-3 mt-3 border-t border-slate-200">
          <div className="px-3 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Admin
          </div>
          <NavLink
            href="/app/settings"
            label="⚙️ Admin Settings"
            onNavigate={onNavigate}
          />
        </div>
      ) : null}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="mt-auto p-3 border-t border-slate-200 bg-white md:bg-slate-50">
      <form action="/api/auth/logout" method="post">
        <button className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
          Logout
        </button>
      </form>
    </div>
  );
}

function NavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-200 border border-transparent hover:border-slate-300"
    >
      {label}
    </Link>
  );
}
