// ovibase/app/app/page.tsx
import Link from "next/link";
import { requireTenant } from "@/src/lib/guards";
import { prisma } from "@/src/lib/prisma";

export default async function DashboardPage() {
  const { tenant } = await requireTenant();

  // Stats (tenant-scoped)
  const [members, leaders, attendance, income, expenses] = await Promise.all([
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

  const attendanceTotal = attendance._sum.total ?? 0;
  const incomeTotal = income._sum.amount ?? 0;
  const expenseTotal = expenses._sum.amount ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Quick overview of your workspace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Members" value={members} href="/app/members" />
        <StatCard title="Leaders" value={leaders} href="/app/leaders" />
        <StatCard title="Attendance" value={attendanceTotal} href="/app/attendance" />
        <StatCard title="Income" value={`£${Number(incomeTotal).toFixed(2)}`} href="/app/finance" />
        <StatCard title="Expenses" value={`£${Number(expenseTotal).toFixed(2)}`} href="/app/finance" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Next up</div>
            <div className="text-sm text-slate-500 mt-1">
              We’ll build these modules one-by-one.
            </div>
          </div>
          <Link
            href="/app/members"
            className="rounded-lg bg-white text-black px-3 py-2 text-sm font-medium hover:bg-zinc-200"
          >
            Add Members
          </Link>
        </div>

        <ul className="list-disc ml-5 mt-3 text-sm text-slate-600 space-y-1">
          <li>Members module (CRUD + search)</li>
          <li>Leaders module</li>
          <li>Attendance tracking</li>
          <li>Finance (income & expenses)</li>
          <li>SMS templates + bulk messaging</li>
        </ul>
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
  value: any;
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

