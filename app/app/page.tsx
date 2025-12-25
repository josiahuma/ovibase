// ovibase/app/app/page.tsx
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import DashboardCelebrations from "@/src/components/DashboardCelebrations";
import { requireTenantWithUserTenant, isAdminRole } from "@/src/lib/guards";

type Celebrant = {
  id: string;
  firstName: string;
  lastName: string | null;
  mobileNumber: string | null;
  dateLabel: string;
  daysAway: number;
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatMonthDay(d: Date) {
  return d.toLocaleDateString("en-GB", { month: "short", day: "2-digit" });
}

function nextOccurrenceDaysAway(date: Date, now: Date) {
  const m = date.getMonth();
  const day = date.getDate();

  const thisYear = new Date(now.getFullYear(), m, day);
  const nextYear = new Date(now.getFullYear() + 1, m, day);

  const target = thisYear >= startOfDay(now) ? thisYear : nextYear;
  const diffMs = startOfDay(target).getTime() - startOfDay(now).getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function buildUpcoming(
  members: Array<{
    id: string;
    firstName: string;
    lastName: string | null;
    mobileNumber: string | null;
    dateOfBirth: Date | null;
    anniversaryDate: Date | null;
  }>,
  field: "dateOfBirth" | "anniversaryDate",
  now: Date,
  daysAhead: number
): Celebrant[] {
  const list: Celebrant[] = [];

  for (const m of members) {
    const d = m[field];
    if (!d) continue;

    const daysAway = nextOccurrenceDaysAway(d, now);
    if (daysAway < 0 || daysAway > daysAhead) continue;

    list.push({
      id: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      mobileNumber: m.mobileNumber,
      dateLabel: formatMonthDay(d),
      daysAway,
    });
  }

  list.sort((a, b) => a.daysAway - b.daysAway);
  return list.slice(0, 20);
}

type SearchParams = Record<string, string | string[] | undefined>;

function getOne(sp: SearchParams, key: string) {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

function Banner({ searchParams }: { searchParams: SearchParams }) {
  const error = getOne(searchParams, "error");
  const sms = getOne(searchParams, "sms");
  const template = getOne(searchParams, "template");

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <div className="font-medium">Action required</div>
        <div className="mt-1">{error}</div>
      </div>
    );
  }

  if (sms === "sent") {
    const count = getOne(searchParams, "count") ?? "0";
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <div className="font-medium">SMS sent successfully</div>
        <div className="mt-1">
          Sent <span className="font-semibold">{count}</span> message
          {count === "1" ? "" : "s"}
          {template ? (
            <>
              {" "}
              using <span className="font-semibold">{template}</span>
            </>
          ) : null}
          .
        </div>
      </div>
    );
  }

  if (sms === "partial") {
    const sent = getOne(searchParams, "sent") ?? "0";
    const failed = getOne(searchParams, "failed") ?? "0";
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <div className="font-medium">SMS partially sent</div>
        <div className="mt-1">
          Sent <span className="font-semibold">{sent}</span>, failed{" "}
          <span className="font-semibold">{failed}</span>
          {template ? (
            <>
              {" "}
              using <span className="font-semibold">{template}</span>
            </>
          ) : null}
          .
        </div>
        <div className="mt-2 text-xs text-amber-900/80">
          Tip: Check SMS Provider settings and ensure numbers are valid (UK format).
        </div>
      </div>
    );
  }

  return null;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const { tenant, ut } = await requireTenantWithUserTenant();
  const isAdmin = isAdminRole(ut.role);
  const canSms = isAdmin || ut.canSms;

  const now = new Date();

  // Always-available stats
  const [membersCount, leadersCount, attendanceAgg, incomeAgg, expenseAgg] =
    await Promise.all([
      prisma.member.count({ where: { tenantId: tenant.id } }),
      prisma.leader.count({ where: { tenantId: tenant.id } }),
      prisma.attendance.aggregate({
        where: { tenantId: tenant.id },
        _sum: { total: true },
      }),
      prisma.finance.aggregate({
        where: { tenantId: tenant.id, type: "income" },
        _sum: { amount: true },
      }),
      prisma.finance.aggregate({
        where: { tenantId: tenant.id, type: "expense" },
        _sum: { amount: true },
      }),
    ]);

  const attendanceTotal = attendanceAgg._sum.total ?? 0;
  const incomeTotal = incomeAgg._sum.amount ?? 0;
  const expenseTotal = expenseAgg._sum.amount ?? 0;

  // Only fetch celebrations/templates if user can use SMS
  let upcomingBirthdays: Celebrant[] = [];
  let upcomingAnniversaries: Celebrant[] = [];
  let smsTemplates: { id: string; name: string; message: string }[] = [];

  if (canSms) {
    const [membersForCelebrations, templates] = await Promise.all([
      prisma.member.findMany({
        where: {
          tenantId: tenant.id,
          OR: [
            { dateOfBirth: { not: null } },
            { anniversaryDate: { not: null } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          mobileNumber: true,
          dateOfBirth: true,
          anniversaryDate: true,
        },
        take: 2000,
      }),
      prisma.smsTemplate.findMany({
        where: { tenantId: tenant.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, message: true },
        take: 200,
      }),
    ]);

    upcomingBirthdays = buildUpcoming(membersForCelebrations, "dateOfBirth", now, 30);
    upcomingAnniversaries = buildUpcoming(
      membersForCelebrations,
      "anniversaryDate",
      now,
      30
    );
    smsTemplates = templates;
  }

  return (
    <div className="space-y-6">
      <Banner searchParams={sp} />

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Quick overview of your workspace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Members" value={membersCount} href="/app/members" />
        <StatCard title="Leaders" value={leadersCount} href="/app/leaders" />
        <StatCard title="Attendance" value={attendanceTotal} href="/app/attendance" />
        <StatCard
          title="Income"
          value={`£${Number(incomeTotal).toFixed(2)}`}
          href="/app/finance"
        />
        <StatCard
          title="Expenses"
          value={`£${Number(expenseTotal).toFixed(2)}`}
          href="/app/finance"
        />
      </div>

      {canSms ? (
        <DashboardCelebrations
          birthdayMembers={upcomingBirthdays}
          anniversaryMembers={upcomingAnniversaries}
          smsTemplates={smsTemplates}
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
          <div className="font-medium">Celebrations & SMS</div>
          <div className="text-sm text-slate-500 mt-1">
            You don’t have SMS permission. Ask your admin to enable “Dashboard send SMS”.
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Quick actions</div>
            <div className="text-sm text-slate-500 mt-1">
              Common things you might want to do next.
            </div>
          </div>
          <Link
            href="/app/members/new"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-3 py-2 text-sm font-medium hover:bg-slate-800"
          >
            Add Member
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-4">
          <QuickLink
            href="/app/attendance/new"
            title="Record attendance"
            desc="Capture men, women, children & event."
          />
          <QuickLink
            href="/app/finance/new"
            title="Add finance record"
            desc="Log income or expense with category."
          />

          {isAdmin ? (
            <>
              <QuickLink
                href="/app/settings/sms-templates"
                title="Manage SMS templates"
                desc="Admin: create reusable messages."
              />
              <QuickLink
                href="/app/settings/sms-provider"
                title="SMS Provider"
                desc="Admin: configure SMS credentials."
              />
            </>
          ) : (
            <>
              <QuickLink
                href="/app/members"
                title="View members"
                desc="Search and update member records."
              />
              <QuickLink
                href="/app/attendance"
                title="Attendance list"
                desc="Review attendance records."
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  href,
}: {
  title: string;
  value: string | number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition"
    >
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-2xl font-semibold mt-2 text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 mt-2">View</div>
    </Link>
  );
}

function QuickLink({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm transition"
    >
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="text-sm text-slate-500 mt-1">{desc}</div>
    </Link>
  );
}
