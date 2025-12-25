//app/leaders/new/page.tsx
import Link from "next/link";
import { createLeader } from "@/src/lib/leaders.actions";
import { requireTenant } from "@/src/lib/guards";
import { prisma } from "@/src/lib/prisma";

export default async function NewLeaderPage() {
  const { tenant } = await requireTenant();

  const churchUnits = await prisma.churchUnitCategory.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ name: "asc" }],
    select: { id: true, name: true, alias: true },
    take: 500,
  });

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Add Leader
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create a new leader record.
          </p>
        </div>

        <Link
          href="/app/leaders"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </Link>
      </div>

      {/* Form */}
      <form
        action={createLeader}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5"
      >
        <LeaderFields churchUnits={churchUnits} />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/app/leaders"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800">
            Save Leader
          </button>
        </div>

        <div className="text-xs text-slate-500">
          Tip: Leaders are used for grouping members and reporting.
        </div>
      </form>
    </div>
  );
}

function LeaderFields({
  churchUnits,
}: {
  churchUnits: { id: string; name: string; alias: string }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="First name" name="firstName" required />
      <Field label="Last name" name="lastName" required />

      <Field label="Email" name="email" type="email" required />
      <Field
        label="Mobile number"
        name="mobileNumber"
        required
        placeholder="e.g. 07900111222"
      />

      <Select
        label="Church unit"
        name="churchUnit"
        required
        placeholder={
          churchUnits.length === 0
            ? "No church units yet — add one in Admin Settings"
            : "Select a church unit..."
        }
        options={churchUnits.map((u) => ({
          value: u.name,
          label: u.name,
          meta: u.alias ? `(${u.alias})` : "",
        }))}
        disabled={churchUnits.length === 0}
      />
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

function Select({
  label,
  name,
  placeholder,
  options,
  disabled,
  required,
}: {
  label: string;
  name: string;
  placeholder: string;
  options: { value: string; label: string; meta?: string }[];
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <label className="space-y-1">
      <div className="text-xs font-medium text-slate-600">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </div>

      <select
        name={name}
        disabled={disabled}
        required={required}
        defaultValue=""
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:bg-slate-100 disabled:text-slate-500"
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label} {o.meta ? ` ${o.meta}` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
