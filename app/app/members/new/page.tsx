// ovibase/app/app/members/new/page.tsx
import Link from "next/link";
import { createMember } from "@/src/lib/members.actions";
import { requireTenant } from "@/src/lib/guards";
import { prisma } from "@/src/lib/prisma";

export default async function NewMemberPage() {
  const { tenant } = await requireTenant();

  const [leaders, churchUnits] = await Promise.all([
    prisma.leader.findMany({
      where: { tenantId: tenant.id },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        churchUnit: true,
      },
      take: 500,
    }),
    prisma.churchUnitCategory.findMany({
      where: { tenantId: tenant.id },
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true, alias: true },
      take: 500,
    }),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Add Member
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create a new member record.
          </p>
        </div>

        <Link
          href="/app/members"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </Link>
      </div>

      {/* Form */}
      <form
        action={createMember}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5"
      >
        <MemberFields leaders={leaders} churchUnits={churchUnits} />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/app/members"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800">
            Save Member
          </button>
        </div>

        <div className="text-xs text-slate-500">
          Tip: Adding date of birth and anniversary enables automatic reminders on
          the dashboard.
        </div>
      </form>
    </div>
  );
}

function MemberFields({
  leaders,
  churchUnits,
}: {
  leaders: { id: string; firstName: string; lastName: string; churchUnit: string }[];
  churchUnits: { id: string; name: string; alias: string }[];
}) {
  const unitOptions = churchUnits.map((u) => ({
    value: u.name,
    label: u.name,
    meta: u.alias ? `(${u.alias})` : "",
  }));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="First name" name="firstName" required />
      <Field label="Last name" name="lastName" />

      <Field label="Email" name="email" type="email" />
      <Field
        label="Mobile number"
        name="mobileNumber"
        placeholder="e.g. 07900111222"
      />

      <Field label="Gender" name="gender" placeholder="male / female" />
      <Field label="Date of birth" name="dateOfBirth" type="date" />

      <Field label="Anniversary date" name="anniversaryDate" type="date" />

      <Select
        label="Church unit"
        name="churchUnit"
        placeholder={
          churchUnits.length === 0
            ? "No church units yet — add one in Admin Settings"
            : "Select a church unit..."
        }
        options={unitOptions}
        disabled={churchUnits.length === 0}
      />

      <Select
        label="Church leader"
        name="churchLeader"
        placeholder={
          leaders.length === 0
            ? "No leaders yet — create a leader first"
            : "Select a leader..."
        }
        options={leaders.map((l) => ({
          value: `${l.firstName} ${l.lastName}`.trim(),
          label: `${l.firstName} ${l.lastName}`.trim(),
          meta: l.churchUnit ? `(${l.churchUnit})` : "",
        }))}
        disabled={leaders.length === 0}
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
