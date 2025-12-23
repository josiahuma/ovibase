import Link from "next/link";
import type { Attendance, EventCategory } from "@prisma/client";
import { requireTenant } from "@/src/lib/guards";
import { prisma } from "@/src/lib/prisma";

type SearchParams = {
  q?: string;
  event?: string;
};

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { tenant } = await requireTenant();

  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const eventFilter = (sp.event ?? "").trim();

  const eventCategories: EventCategory[] = await prisma.eventCategory.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: "asc" },
    take: 500,
  });

  const where: any = { tenantId: tenant.id };

  if (q) {
    // event is stored as a string in Attendance model
    where.OR = [{ event: { contains: q } }];
  }

  if (eventFilter) {
    where.event = eventFilter;
  }

  const records: Attendance[] = await prisma.attendance.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 200,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Attendance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Record and track attendance for events.
          </p>
        </div>

        <Link
          href="/app/attendance/new"
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-3 py-2 text-sm font-medium hover:bg-slate-800"
        >
          + Add Attendance
        </Link>
      </div>

      <form className="grid gap-2 sm:grid-cols-[1fr_240px_120px]">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by event name..."
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400"
        />

        <label className="space-y-1">
          <div className="text-xs font-medium text-slate-600">Event category</div>
          <select
            name="event"
            defaultValue={eventFilter}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          >
            <option value="">All</option>
            {eventCategories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Apply
        </button>
      </form>

      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Event</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Men</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Women</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">
                Children
              </th>
              <th className="text-left px-4 py-3">Total</th>
              <th className="text-right px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {records.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={7}>
                  No attendance records found.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 text-slate-900">
                    {new Date(r.date).toISOString().slice(0, 10)}
                  </td>
                  <td className="px-4 py-3 text-slate-900">{r.event}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-700">
                    {r.men}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-700">
                    {r.women}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-700">
                    {r.children}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {r.total}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/app/attendance/${r.id}`}
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
  );
}
