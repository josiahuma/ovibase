import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma"; // adjust if your prisma path differs

function fillMonths(rows: Array<{ month: number; total: number }>) {
  const map = new Map(rows.map(r => [r.month, Number(r.total)]));
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { month, total: map.get(month) ?? 0 };
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");
  const year = Number(searchParams.get("year"));

  if (!tenantId) return NextResponse.json({ error: "tenantId is required" }, { status: 400 });
  if (!year || Number.isNaN(year)) return NextResponse.json({ error: "year is required" }, { status: 400 });

  // ✅ Efficient: SUM(total) grouped by MONTH(date)
  const rows = await prisma.$queryRaw<Array<{ month: number; total: any }>>`
    SELECT 
      MONTH(\`date\`) as month,
      SUM(\`total\`) as total
    FROM Attendance
    WHERE tenantId = ${tenantId}
      AND YEAR(\`date\`) = ${year}
    GROUP BY MONTH(\`date\`)
    ORDER BY MONTH(\`date\`) ASC
  `;

  return NextResponse.json({
    year,
    data: fillMonths(rows.map(r => ({ month: Number(r.month), total: Number(r.total ?? 0) }))),
  });
}
