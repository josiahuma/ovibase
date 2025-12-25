// app/app/MobileSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = { href: string; label: string };

export default function MobileSidebar({
  tenantName,
  tenantSlug,
  navItems,
  adminItems,
}: {
  tenantName: string;
  tenantSlug: string;
  navItems: NavItem[];
  adminItems: NavItem[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        aria-label="Open menu"
      >
        <span className="text-lg leading-none">☰</span>
      </button>

      {/* Overlay */}
      {open ? (
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/30"
        />
      ) : null}

      {/* Drawer */}
      <div
        className={[
          "fixed z-50 top-0 left-0 h-full w-[280px] bg-slate-50 border-r border-slate-200",
          "transform transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-4 border-b border-slate-200 flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-bold tracking-tight">OviBase</div>
            <div className="text-xs text-slate-500 mt-1">
              {tenantName}{" "}
              <span className="text-slate-400">({tenantSlug})</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="p-3 space-y-1 text-sm">
          {navItems.map((i) => (
            <DrawerLink key={i.href} href={i.href} label={i.label} />
          ))}

          {adminItems.length ? (
            <div className="pt-3 mt-3 border-t border-slate-200">
              <div className="px-3 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Admin
              </div>
              {adminItems.map((i) => (
                <DrawerLink key={i.href} href={i.href} label={i.label} />
              ))}
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
      </div>
    </>
  );
}

function DrawerLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "block rounded-lg px-3 py-2 border",
        active
          ? "bg-white border-slate-300 text-slate-900"
          : "text-slate-700 hover:bg-slate-200 border-transparent hover:border-slate-300",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}
