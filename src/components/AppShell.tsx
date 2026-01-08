"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import type { UserRole } from "@prisma/client";
import { TenantPlan } from "../lib/billing";

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
  donationUrl,
  stripeEnabled,
}: {
  children: React.ReactNode;
  tenant: Tenant;
  ut: UserTenant;
  isAdmin: boolean;
  donationUrl: string;
  tenantPlan: TenantPlan;
  stripeEnabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);

  // ✅ refs for downloading QR
  const qrWrapRef = useRef<HTMLDivElement | null>(null);

  // lock body scroll when menu open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  const links = [
    { href: "/app", label: "Dashboard", show: true },
    { href: "/app/members", label: "Members", show: isAdmin || ut.canMembers },
    { href: "/app/leaders", label: "Leaders", show: isAdmin || ut.canLeaders },
    {
      href: "/app/attendance",
      label: "Attendance",
      show: isAdmin || ut.canAttendance,
    },
    { href: "/app/finance", label: "Finance", show: isAdmin || ut.canFinance },
    // { href: "/app/sms", label: "SMS", show: isAdmin || ut.canSms },
  ].filter((l) => l.show);

  async function copyDonationLink() {
    try {
      // Modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(donationUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        return;
      }

      // Fallback: hidden textarea + execCommand
      const ta = document.createElement("textarea");
      ta.value = donationUrl;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, ta.value.length);

      const ok = document.execCommand("copy");
      document.body.removeChild(ta);

      if (!ok) throw new Error("execCommand copy failed");

      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Final fallback: prompt (user can CTRL+C)
      prompt("Copy donation link:", donationUrl);
    }
  }

  // ✅ Download QR code (react-qr-code renders SVG)
  function downloadQrPng() {
  try {
    const wrap = qrWrapRef.current;
    if (!wrap) return;

    const svg = wrap.querySelector("svg");
    if (!svg) return;

    // Clone so we can safely modify attributes
    const cloned = svg.cloneNode(true) as SVGElement;

    // Force proper SVG namespace + size (important for consistent rasterization)
    cloned.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    cloned.setAttribute("width", "600");
    cloned.setAttribute("height", "600");
    cloned.setAttribute("viewBox", cloned.getAttribute("viewBox") || "0 0 256 256");

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(cloned);

    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new window.Image();

    img.onload = () => {
      const size = 600;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        return;
      }

      // White background for print/posters
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);

      // Draw QR
      ctx.drawImage(img, 0, 0, size, size);

      URL.revokeObjectURL(url);

      // Create PNG
      const pngUrl = canvas.toDataURL("image/png");

      // Trigger download
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `${tenant.slug}-donation-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      // Fallback: open the SVG in a new tab so user can still save
      window.open(url, "_blank", "noopener,noreferrer");
    };

    img.src = url;
  } catch {
    // Last fallback: open donationUrl (better than doing nothing)
    window.open(donationUrl, "_blank", "noopener,noreferrer");
  }
}


  const disabledTitle = "Complete Stripe setup in Settings";
  const enabledDonateTitle = "Open donation page";
  const enabledCopyTitle = "Copy donation link";
  const enabledQrTitle = "Show QR code";

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

              {/* Right side actions */}
              <div className="flex items-center gap-2">
                {/* Donate button */}
                <a
                  href={stripeEnabled ? donationUrl : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!stripeEnabled) e.preventDefault();
                  }}
                  title={stripeEnabled ? enabledDonateTitle : disabledTitle}
                  className={[
                    "hidden md:inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium border",
                    stripeEnabled
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed",
                  ].join(" ")}
                >
                  Donate ❤️
                </a>

                {/* Copy donation link */}
                <button
                  onClick={copyDonationLink}
                  disabled={!stripeEnabled}
                  title={stripeEnabled ? enabledCopyTitle : disabledTitle}
                  className={[
                    "hidden md:inline-flex items-center justify-center rounded-lg border h-8 w-8 text-xs",
                    stripeEnabled
                      ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed",
                  ].join(" ")}
                  aria-label="Copy donation link"
                >
                  📋
                </button>

                {/* QR code button */}
                <button
                  onClick={() => setShowQr(true)}
                  disabled={!stripeEnabled}
                  title={stripeEnabled ? enabledQrTitle : disabledTitle}
                  className={[
                    "hidden md:inline-flex items-center justify-center rounded-lg border h-8 w-8 text-xs",
                    stripeEnabled
                      ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed",
                  ].join(" ")}
                  aria-label="Show donation QR code"
                >
                  ▢
                </button>

                {/* Copied toast */}
                {copied ? (
                  <div className="hidden md:block rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                    Link copied
                  </div>
                ) : null}

                {/* Mobile workspace label */}
                <div className="md:hidden text-xs text-slate-500">{tenant.name}</div>
              </div>
            </div>

            {/* Stripe disabled helper */}
            {!stripeEnabled ? (
              <div className="hidden md:flex items-center justify-end px-6 pb-3">
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Donations are disabled.{" "}
                  <Link href="/app/settings/stripe" className="underline font-medium">
                    Complete Stripe setup
                  </Link>
                  .
                </div>
              </div>
            ) : null}
          </header>

          <div className="p-4 sm:p-6 bg-white min-h-screen">{children}</div>

          {/* QR Modal */}
          {showQr ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
              <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Donation QR Code
                    </div>
                    <div className="text-xs text-slate-500">
                      Scan to donate to {tenant.name}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowQr(false)}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white h-9 w-9 text-slate-700 hover:bg-slate-50"
                    aria-label="Close QR modal"
                  >
                    ✕
                  </button>
                </div>

                <div
                  ref={qrWrapRef}
                  className="flex justify-center rounded-lg border border-slate-200 bg-white p-4"
                >
                  {/* react-qr-code renders SVG */}
                  <QRCode value={donationUrl} size={220} />
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 break-all">
                  {donationUrl}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={copyDonationLink}
                    className="inline-flex flex-1 items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
                  >
                    Copy Link
                  </button>

                  <a
                    href={donationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Open
                  </a>

                  {/* ✅ Download QR button */}
                  <button
                    onClick={downloadQrPng}
                    title="Download QR code"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
                    aria-label="Download QR code"
                  >
                    ⬇️
                  </button>
                </div>
              </div>
            </div>
          ) : null}
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
            {tenant.name} <span className="text-slate-400">({tenant.slug})</span>
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
        <NavLink
          key={l.href}
          href={l.href}
          label={l.label}
          onNavigate={onNavigate}
        />
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
