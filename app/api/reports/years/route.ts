import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getTenantFromRequest } from "@/src/lib/tenant";

export async function GET(req: Request) {
  const tenant = await getTenantFromRequest();
  const tenantId = tenant?.id;

  if (!tenantId) {
    return NextResponse.json({ error: "No tenant in session" }, { status: 401 });
  }

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
    new Set([
      ...attendanceYears.map(x => Number(x.y)),
      ...financeYears.map(x => Number(x.y)),
    ])
  )
    .filter(Boolean)
    .sort((a, b) => b - a);

  return NextResponse.json({ years });
}
