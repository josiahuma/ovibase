// ovibase/app/app/attendance/new/page.tsx
import Link from "next/link";
import type { EventCategory } from "@prisma/client";
import { requireTenant } from "@/src/lib/guards";
import { prisma } from "@/src/lib/prisma";
import { createAttendance } from "@/src/lib/attendance.actions";

export default async function NewAttendancePage() {
  const { tenant } = await requireTenant();

  const categories: EventCategory[] = await prisma.eventCategory.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: "asc" },
    take: 500,
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Add Attendance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Record attendance for an event category.
          </p>
        </div>

        <Link
          href="/app/attendance"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="text-slate-900 font-medium">
            You don’t have any event categories yet.
          </div>
          <div className="text-sm text-slate-500">
            Create at least one event category so you can select it here.
          </div>
          <Link
            href="/event-categories"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
          >
            Go to Event Categories
          </Link>
        </div>
      ) : (
        <form
          action={createAttendance}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date" name="date" type="date" required />

            <SelectField
              label="Event category"
              name="event"
              required
              placeholder="Select an event category..."
              options={categories.map((c: EventCategory) => ({
                value: c.name,
                label: c.name,
              }))}
            />

            <Field label="Men" name="men" type="number" required placeholder="0" />
            <Field label="Women" name="women" type="number" required placeholder="0" />
            <Field label="Children" name="children" type="number" required placeholder="0" />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Link
              href="/app/attendance"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800">
              Save Attendance
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
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
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400"
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
}: {
  label: string;
  name: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <label className="space-y-1">
      <div className="text-xs font-medium text-slate-600">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </div>
      <select
        name={name}
        required={required}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
        defaultValue=""
      >
        <option value="" disabled>
          {placeholder ?? "Select..."}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
