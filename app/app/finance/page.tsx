import Link from "next/link";
import { requireTenant } from "@/src/lib/guards";
import { prisma } from "@/src/lib/prisma";

type SearchParams = { q?: string; type?: string };

export default async function FinancePage(props: { searchParams: Promise<SearchParams> | SearchParams }) {
  const { tenant } = await requireTenant();

  // ✅ Next 16.1 may provide searchParams as a Promise — unwrap safely
  const sp = (await (props.searchParams as any)) as SearchParams;

  const q = (sp?.q || "").trim();
  const type = (sp?.type || "").trim().toLowerCase(); // "income" | "expense" | ""

  const where: any = { tenantId: tenant.id };

  if (type === "income" || type === "expense") {
    where.type = type;
  }

  if (q) {
    where.OR = [{ description: { contains: q } }];
  }

  const [records, incomeAgg, expenseAgg] = await Promise.all([
    prisma.finance.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 300,
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

  const incomeTotal = Number(incomeAgg._sum.amount ?? 0);
  const expenseTotal = Number(expenseAgg._sum.amount ?? 0);
  const net = incomeTotal - expenseTotal;

  const formatMoney = (n: number) => `£${n.toFixed(2)}`;
  const formatDate = (d: Date) => new Date(d).toISOString().slice(0, 10);

  const typeBadge = (t: string) => {
    if (t === "income") {
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-100">
          Income
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 border border-red-100">
        Expense
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Finance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track income and expenses for your workspace.
          </p>
        </div>

        <Link
          href="/app/finance/new"
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Add Record
        </Link>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard title="Total Income" value={formatMoney(incomeTotal)} hint="All time" />
        <SummaryCard title="Total Expenses" value={formatMoney(expenseTotal)} hint="All time" />
        <SummaryCard title="Net" value={formatMoney(net)} hint={net >= 0 ? "Positive" : "Negative"} />
      </div>

      {/* Filters */}
      <form className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 md:col-span-2">
            <div className="text-xs font-medium text-slate-600">Search</div>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search descriptions (e.g. offering, rent, transport...)"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Type</div>
            <select
              name="type"
              defaultValue={type || ""}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
            >
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            Showing <span className="font-medium text-slate-700">{records.length}</span> record(s)
          </div>

          <div className="flex gap-2">
            <button className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Apply
            </button>

            {(q || type) && (
              <Link
                href="/app/finance"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear
              </Link>
            )}
          </div>
        </div>
      </form>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Description</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
                <th className="text-right px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {records.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-slate-500" colSpan={5}>
                    No finance records yet. Add your first income or expense.
                  </td>
                </tr>
              ) : (
                records.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {formatDate(r.date)}
                    </td>

                    <td className="px-4 py-3">{typeBadge(r.type)}</td>

                    <td className="px-4 py-3 text-slate-800">
                      {r.description ? r.description : <span className="text-slate-400">—</span>}
                    </td>

                    <td className="px-4 py-3 text-right font-medium text-slate-900 whitespace-nowrap">
                      {formatMoney(Number(r.amount))}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/app/finance/${r.id}`}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View / Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium text-slate-600">{title}</div>
      <div className="text-xl font-semibold text-slate-900 mt-2">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{hint}</div>
    </div>
  );
}
