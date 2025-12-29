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

    if (!tenantId) {
      return NextResponse.json({ error: "No tenant in session" }, { status: 401 });
    }
    if (!year || Number.isNaN(year)) {
      return NextResponse.json({ error: "year is required" }, { status: 400 });
    }
    if (!month || Number.isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: "month must be 1-12" }, { status: 400 });
    }

    /**
     * CURRENT SCHEMA:
     * Attendance has `event` (string) not an eventId/categoryId.
     * So we match Attendance.event to EventCategory.name.
     *
     * IMPORTANT: This requires that Attendance.event values are the same as EventCategory.name.
     * Example:
     *   Attendance.event = "Sunday Encounter"
     *   EventCategory.name = "Sunday Encounter"
     */
    const rows = await prisma.$queryRaw<Array<{ category: string; total: any }>>`
      SELECT
        c.name AS category,
        COALESCE(SUM(a.\`total\`), 0) AS total
      FROM EventCategory c
      LEFT JOIN Attendance a
        ON a.\`event\` = c.name
        AND a.tenantId = ${tenantId}
        AND YEAR(a.\`date\`) = ${year}
        AND MONTH(a.\`date\`) = ${month}
      WHERE c.tenantId = ${tenantId}
      GROUP BY c.id, c.name
      ORDER BY total DESC, c.name ASC
    `;

    return NextResponse.json({
      year,
      month,
      data: rows.map((r) => ({
        category: String(r.category),
        total: Number(r.total ?? 0),
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "attendance-by-category failed",
        message: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
