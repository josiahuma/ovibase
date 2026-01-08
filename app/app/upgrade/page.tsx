import Link from "next/link";
import { requireTenantWithUserTenant, isAdminRole } from "@/src/lib/guards";
import { getTenantPlan } from "@/src/lib/billing";

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; canceled?: string; reason?: string }>;
}) {
  const sp = await searchParams;
  const { tenant, ut } = await requireTenantWithUserTenant();
  const isAdmin = isAdminRole(ut.role);

  const plan = await getTenantPlan(tenant.id);

  const isPro = plan.plan === "PRO";
  const isTrialing = plan.status === "trialing";
  const isActive = plan.status === "active";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Upgrade
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Free includes Members only. Start a 30-day free trial to unlock all modules, then £19/month.
        </p>
      </div>

      {/* Redirect reason banner */}
      {sp.reason === "pro" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
          This feature requires Pro. Start your free trial or upgrade to continue.
        </div>
      ) : null}

      {/* Stripe redirect success/cancel */}
      {sp.ok ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
          ✅ You’re all set — Pro access is now unlocked.
        </div>
      ) : null}

      {sp.canceled ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          Payment canceled.
        </div>
      ) : null}

      {/* Status banner based on current plan */}
      {isTrialing ? (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 shadow-sm">
          🎉 Your 30-day free trial is active. All Pro features are unlocked.
          {plan.currentPeriodEnd ? (
            <span className="ml-1">
              Trial ends on{" "}
              <span className="font-medium">
                {plan.currentPeriodEnd.toLocaleDateString()}
              </span>
              .
            </span>
          ) : null}
        </div>
      ) : isActive ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
          ✅ Pro subscription is active. All features are unlocked.
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-semibold text-slate-900">OviBase Pro</div>
            <div className="text-sm text-slate-500 mt-1">
              Unlock Attendance, Finance, SMS, Reports, Users & Permissions, and all Admin Settings modules.
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-semibold text-slate-900">£19</div>
            <div className="text-xs text-slate-500">per month</div>
          </div>
        </div>

        <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1">
          <li>Attendance recording + reports</li>
          <li>Finance income/expense tracking</li>
          <li>Bulk SMS + templates</li>
          <li>Users & permissions</li>
          <li>All admin settings modules</li>
        </ul>

        <div className="flex flex-wrap items-center gap-4">
          <div className="text-xs text-slate-500">
            Current plan:{" "}
            <span className="font-medium text-slate-900">{plan.plan}</span>
          </div>
          <div className="text-xs text-slate-500">
            Status:{" "}
            <span className="font-medium text-slate-900">{plan.status}</span>
          </div>
          {plan.currentPeriodEnd ? (
            <div className="text-xs text-slate-500">
              Renews/ends:{" "}
              <span className="font-medium text-slate-900">
                {plan.currentPeriodEnd.toLocaleDateString()}
              </span>
            </div>
          ) : null}
        </div>

        {!isAdmin ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Only the workspace owner/admin can upgrade.
          </div>
        ) : isPro ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            You already have Pro access{isTrialing ? " (trialing)." : "."}
          </div>
        ) : (
          <form action="/api/billing/checkout" method="post">
            <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800">
              Start 30-day free trial
            </button>
            <div className="mt-2 text-xs text-slate-500">
              You won’t be charged until the trial ends. Cancel anytime.
            </div>
          </form>
        )}

        <Link
          href="/app"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
