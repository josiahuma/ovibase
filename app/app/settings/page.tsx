import Link from "next/link";
import { requireAdmin } from "@/src/lib/guards";
import { requireTenant } from "@/src/lib/guards";
import { getTenantPlan } from "@/src/lib/billing";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const { tenant } = await requireTenant();
  const plan = await getTenantPlan(tenant.id);

  const isPro = plan.plan === "PRO";

  const cards = [
    {
      title: "Income Categories",
      desc: "Create and manage income category list.",
      href: "/app/settings/income-categories",
      proOnly: true,
    },
    {
      title: "Expense Categories",
      desc: "Create and manage expense category list.",
      href: "/app/settings/expense-categories",
      proOnly: true,
    },
    {
      title: "Event Categories",
      desc: "Categories used for attendance records.",
      href: "/app/settings/event-categories",
      proOnly: true,
    },
    {
      title: "Church Unit Categories",
      desc: "Manage units like Choir, Youth, Media, etc.",
      href: "/app/settings/church-unit-categories",
      proOnly: false, // keep free because members use it
    },
    {
      title: "SMS Templates",
      desc: "Create reusable SMS messages for reminders and bulk messaging.",
      href: "/app/settings/sms-templates",
      proOnly: true,
    },
    {
      title: "SMS Provider",
      desc: "Configure your SMS provider credentials (TxtLocal/Twilio/etc).",
      href: "/app/settings/sms-provider",
      proOnly: true,
    },
    {
      title: "Users & Permissions",
      desc: "Create staff accounts and choose what they can access.",
      href: "/app/settings/users",
      proOnly: true,
    },
    {
      title: "Reports",
      desc: "View and manage reports for attendance and finance.",
      href: "/app/settings/reports",
      proOnly: true,
    },
    {
      title: "Stripe Settings",
      desc: "Configure your webhook settings for Stripe and other services.",
      href: "/app/settings/stripe",
      proOnly: false, // keep free so donations can work
    },
    {
      title: "Donation Types",
      desc: "Manage donation types for your organization.",
      href: "/app/settings/donation-funds",
      proOnly: false, // keep free so donations can work
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Admin Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure categories, messaging and admin-only workspace settings.
        </p>
      </div>

      {!isPro ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
          You are on the <span className="font-semibold">Free</span> plan.
          Only Members (and Donations setup) are available.{" "}
          <Link href="/app/upgrade" className="underline font-medium">
            Upgrade to Pro
          </Link>{" "}
          to unlock everything.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => {
          const locked = c.proOnly && !isPro;

          return locked ? (
            <div
              key={c.href}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm opacity-90"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">{c.title}</div>
                  <div className="text-sm text-slate-500 mt-1">{c.desc}</div>
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  Locked
                </div>
              </div>

              <div className="text-sm text-slate-600 mt-4 font-medium">
                Requires Pro →
              </div>

              <div className="mt-3">
                <Link
                  href="/app/upgrade?reason=pro"
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-3 py-2 text-sm font-medium hover:bg-slate-800"
                >
                  Upgrade
                </Link>
              </div>
            </div>
          ) : (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="font-semibold text-slate-900">{c.title}</div>
              <div className="text-sm text-slate-500 mt-1">{c.desc}</div>
              <div className="text-sm text-slate-700 mt-4 font-medium">
                Manage →
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
