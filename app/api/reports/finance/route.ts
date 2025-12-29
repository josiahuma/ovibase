import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

type Row = { month: number; income: any; expense: any };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");
  const year = Number(searchParams.get("year"));

  if (!tenantId) return NextResponse.json({ error: "tenantId is required" }, { status: 400 });
  if (!year || Number.isNaN(year)) return NextResponse.json({ error: "year is required" }, { status: 400 });

  const rows = await prisma.$queryRaw<Row[]>`
    SELECT
      MONTH(\`date\`) as month,
      SUM(CASE WHEN \`type\` = 'income' THEN \`amount\` ELSE 0 END) as income,
      SUM(CASE WHEN \`type\` = 'expense' THEN \`amount\` ELSE 0 END) as expense
    FROM Finance
    WHERE tenantId = ${tenantId}
      AND YEAR(\`date\`) = ${year}
    GROUP BY MONTH(\`date\`)
    ORDER BY MONTH(\`date\`) ASC
  `;

  const map = new Map(rows.map(r => [Number(r.month), r]));
  const data = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const r = map.get(month);
    return {
      month,
      income: r ? Number(r.income ?? 0) : 0,
      expense: r ? Number(r.expense ?? 0) : 0,
    };
  });

  return NextResponse.json({ year, data });
}
