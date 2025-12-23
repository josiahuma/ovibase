// ovibase/app/app/settings/page.tsx
import Link from "next/link";
import { requireAdmin } from "@/src/lib/guards";

export default async function AdminSettingsPage() {
  await requireAdmin();

  const cards = [
    {
      title: "Income Categories",
      desc: "Create and manage income category list.",
      href: "/app/settings/income-categories",
    },
    {
      title: "Expense Categories",
      desc: "Create and manage expense category list.",
      href: "/app/settings/expense-categories",
    },
    {
      title: "Event Categories",
      desc: "Categories used for attendance records.",
      href: "/app/settings/event-categories",
    },
    {
      title: "Church Unit Categories",
      desc: "Manage units like Choir, Youth, Media, etc.",
      href: "/app/settings/church-unit-categories",
    },
    {
      title: "SMS Templates",
      desc: "Create reusable SMS messages for reminders and bulk messaging.",
      href: "/app/settings/sms-templates",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Admin Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure categories and admin-only workspace settings.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
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
        ))}
      </div>
    </div>
  );
}
