// ovibase/app/app/attendance/[id]/page.tsx
import Link from "next/link";
import type { Attendance, EventCategory } from "@prisma/client";
import { requireTenant } from "@/src/lib/guards";
import { prisma } from "@/src/lib/prisma";
import { deleteAttendance, updateAttendance } from "@/src/lib/attendance.actions";

export default async function AttendanceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { tenant } = await requireTenant();

  const record: Attendance | null = await prisma.attendance.findFirst({
    where: { id: params.id, tenantId: tenant.id },
  });

  if (!record) {
    return (
      <div className="space-y-4">
        <div className="text-xl font-semibold text-slate-900">Attendance not found</div>
        <Link className="text-slate-700 underline" href="/app/attendance">
          Back to attendance
        </Link>
      </div>
    );
  }

  const categories: EventCategory[] = await prisma.eventCategory.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: "asc" },
    take: 500,
  });

  async function onUpdate(formData: FormData) {
    "use server";
    await updateAttendance(record.id, formData);
  }

  async function onDelete() {
    "use server";
    await deleteAttendance(record.id);
  }

  const toDateValue = (d: Date) => new Date(d).toISOString().slice(0, 10);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Edit Attendance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Update this attendance record.
          </p>
        </div>

        <Link
          href="/app/attendance"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </Link>
      </div>

      <form
        action={onUpdate}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Date"
            name="date"
            type="date"
            required
            defaultValue={toDateValue(record.date)}
          />

          <SelectField
            label="Event category"
            name="event"
            required
            defaultValue={record.event}
            placeholder="Select an event category..."
            options={categories.map((c: EventCategory) => ({
              value: c.name,
              label: c.name,
            }))}
          />

          <Field label="Men" name="men" type="number" required defaultValue={String(record.men)} />
          <Field label="Women" name="women" type="number" required defaultValue={String(record.women)} />
          <Field
            label="Children"
            name="children"
            type="number"
            required
            defaultValue={String(record.children)}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            Current total:{" "}
            <span className="font-semibold text-slate-900">{record.total}</span>
          </div>

          <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800">
            Save Changes
          </button>
        </div>
      </form>

      <form action={onDelete}>
        <button className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
          Delete Record
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-1">
      <div className="text-xs font-medium text-slate-600">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </div>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  placeholder,
  options,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="space-y-1">
      <div className="text-xs font-medium text-slate-600">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </div>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
      >
        {!defaultValue ? (
          <option value="" disabled>
            {placeholder ?? "Select..."}
          </option>
        ) : null}

        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
