// ovibase/app/app/unauthorized/page.tsx
import Link from "next/link";
import { requireTenantWithUserTenant, isAdminRole } from "@/src/lib/guards";

export default async function UnauthorizedPage() {
  const { tenant, ut } = await requireTenantWithUserTenant();
  const isAdmin = isAdminRole(ut.role);

  const perms = [
    { label: "Members", ok: isAdmin || ut.canMembers },
    { label: "Leaders", ok: isAdmin || ut.canLeaders },
    { label: "Attendance", ok: isAdmin || ut.canAttendance },
    { label: "Finance", ok: isAdmin || ut.canFinance },
    { label: "SMS", ok: isAdmin || ut.canSms },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Access denied
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          You don’t have permission to view that page in{" "}
          <span className="font-medium text-slate-700">{tenant.name}</span>.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="font-medium text-slate-900">Your permissions</div>
        <div className="text-sm text-slate-500 mt-1">
          Ask an admin to enable access if you need it.
        </div>

        <ul className="mt-4 space-y-2 text-sm">
          {perms.map((p) => (
            <li
              key={p.label}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
            >
              <span className="text-slate-700">{p.label}</span>
              <span
                className={
                  p.ok
                    ? "text-green-700 bg-green-50 border border-green-200 rounded-md px-2 py-0.5"
                    : "text-red-700 bg-red-50 border border-red-200 rounded-md px-2 py-0.5"
                }
              >
                {p.ok ? "Allowed" : "Not allowed"}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href="/app"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
          >
            Go to Dashboard
          </Link>

          {isAdmin ? (
            <Link
              href="/app/settings/users"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Manage users & permissions
            </Link>
          ) : null}
        </div>
      </div>

      <div className="text-xs text-slate-500">
        Tip: If you were just created as a staff user, ask the admin to tick the
        correct permissions (Members / Leaders / Attendance / Finance / SMS).
      </div>
    </div>
  );
}
