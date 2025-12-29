import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getTenantFromRequest } from "@/src/lib/tenant";

export async function GET(req: Request) {
  try {
    const tenant = await getTenantFromRequest();
    const tenantId = tenant?.id;

    const { searchParams } = new URL(req.url);
    const year = Number(searchParams.get("year"));
    const month = Number(searchParams.get("month"));

    if (!tenantId) return NextResponse.json({ error: "No tenant in session" }, { status: 401 });
    if (!year || Number.isNaN(year)) return NextResponse.json({ error: "year is required" }, { status: 400 });
    if (!month || Number.isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: "month must be 1-12" }, { status: 400 });
    }

    // Income breakdown (match Finance.category to IncomeCategory.name)
    const incomeRows = await prisma.$queryRaw<Array<{ category: string; total: any }>>`
      SELECT
        c.name AS category,
        COALESCE(SUM(f.\`amount\`), 0) AS total
      FROM IncomeCategory c
      LEFT JOIN Finance f
        ON f.\`type\` = 'income'
        AND f.\`category\` = c.name
        AND f.tenantId = ${tenantId}
        AND YEAR(f.\`date\`) = ${year}
        AND MONTH(f.\`date\`) = ${month}
      WHERE c.tenantId = ${tenantId}
      GROUP BY c.id, c.name
      ORDER BY total DESC, c.name ASC
    `;

    // Expense breakdown (match Finance.category to ExpenseCategory.name)
    const expenseRows = await prisma.$queryRaw<Array<{ category: string; total: any }>>`
      SELECT
        c.name AS category,
        COALESCE(SUM(f.\`amount\`), 0) AS total
      FROM ExpenseCategory c
      LEFT JOIN Finance f
        ON f.\`type\` = 'expense'
        AND f.\`category\` = c.name
        AND f.tenantId = ${tenantId}
        AND YEAR(f.\`date\`) = ${year}
        AND MONTH(f.\`date\`) = ${month}
      WHERE c.tenantId = ${tenantId}
      GROUP BY c.id, c.name
      ORDER BY total DESC, c.name ASC
    `;

    return NextResponse.json({
      year,
      month,
      income: incomeRows.map((r) => ({ category: String(r.category), total: Number(r.total ?? 0) })),
      expense: expenseRows.map((r) => ({ category: String(r.category), total: Number(r.total ?? 0) })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "finance-by-category failed", message: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
