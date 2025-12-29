import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");

  if (!tenantId) return NextResponse.json({ error: "tenantId is required" }, { status: 400 });

  // Pull years from both tables, merge distinct
  const attendanceYears = await prisma.$queryRaw<Array<{ y: number }>>`
    SELECT DISTINCT YEAR(\`date\`) as y
    FROM Attendance
    WHERE tenantId = ${tenantId}
    ORDER BY y DESC
  `;

  const financeYears = await prisma.$queryRaw<Array<{ y: number }>>`
    SELECT DISTINCT YEAR(\`date\`) as y
    FROM Finance
    WHERE tenantId = ${tenantId}
    ORDER BY y DESC
  `;

  const years = Array.from(
    new Set([...attendanceYears.map(x => Number(x.y)), ...financeYears.map(x => Number(x.y))])
  ).sort((a, b) => b - a);

  return NextResponse.json({ years });
}
