import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTenant } from "@/src/lib/guards";
import { prisma } from "@/src/lib/prisma";
import { deleteAttendance, updateAttendance } from "@/src/lib/attendance.actions";

export default async function AttendanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { tenant } = await requireTenant();
  const { id } = await params;

  const record = await prisma.attendance.findFirst({
    where: { id, tenantId: tenant.id },
  });

  // ✅ RETURN fixes TS narrowing
  if (!record) return notFound();

  const recordId = record.id;

  async function onUpdate(formData: FormData) {
    "use server";
    await updateAttendance(recordId, formData);
  }

  async function onDelete() {
    "use server";
    await deleteAttendance(recordId);
  }

  const toDateValue = (d: Date) => new Date(d).toISOString().slice(0, 10);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Attendance Record
          </h1>
          <p className="text-sm text-slate-500 mt-1">Edit attendance details.</p>
        </div>

        <Link
          href="/app/attendance"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </Link>
      </div>

      {/* Form */}
      <form
        action={onUpdate}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Date</div>
            <input
              name="date"
              type="date"
              defaultValue={toDateValue(record.date)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Event</div>
            <input
              name="event"
              defaultValue={record.event || ""}
              placeholder="e.g. Sunday Service"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Men</div>
            <input
              name="men"
              type="number"
              defaultValue={String(record.men ?? 0)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Women</div>
            <input
              name="women"
              type="number"
              defaultValue={String(record.women ?? 0)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Children</div>
            <input
              name="children"
              type="number"
              defaultValue={String(record.children ?? 0)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Total</div>
            <input
              name="total"
              type="number"
              defaultValue={String(record.total ?? 0)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </label>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/app/attendance"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800">
            Save Changes
          </button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="font-medium text-red-800">Danger zone</div>
            <div className="text-sm text-red-700 mt-1">
              Deleting this attendance record is permanent.
            </div>
          </div>

          <form action={onDelete}>
            <button className="inline-flex items-center justify-center rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700">
              Delete Record
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
