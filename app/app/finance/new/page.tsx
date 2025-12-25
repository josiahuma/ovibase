// app/app/finance/new/page.tsx
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import FinanceNewForm from "./FinanceNewForm";
import { requirePermission } from "@/src/lib/permissions";

export default async function NewFinancePage() {
  const { tenant } = await requirePermission("finance");

  const [incomeCategories, expenseCategories] = await Promise.all([
    prisma.incomeCategory.findMany({
      where: { tenantId: tenant.id },
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true },
      take: 500,
    }),
    prisma.expenseCategory.findMany({
      where: { tenantId: tenant.id },
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true },
      take: 500,
    }),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Add Finance Record
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Record income or expense for your workspace.
          </p>
        </div>

        <Link
          href="/app/finance"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </Link>
      </div>

      <FinanceNewForm
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
      />
    </div>
  );
}
