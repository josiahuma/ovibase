"use client";

import { publicJoinMember } from "@/src/lib/public-member.actions";

export default function JoinMemberForm({
  tenantName,
  leaders,
  churchUnits,
}: {
  tenantName: string;
  leaders: { firstName: string; lastName: string; churchUnit: string }[];
  churchUnits: { name: string; alias: string }[];
}) {
  const unitOptions = churchUnits.map((u) => ({
    value: u.name,
    label: u.name,
    meta: u.alias ? `(${u.alias})` : "",
  }));

  const leaderOptions = leaders.map((l) => ({
    value: `${l.firstName} ${l.lastName}`.trim(),
    label: `${l.firstName} ${l.lastName}`.trim(),
    meta: l.churchUnit ? `(${l.churchUnit})` : "",
  }));

  return (
    <form action={publicJoinMember} className="space-y-5">
      {/* Honeypot - hidden from humans */}
      <input
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" name="firstName" required />
        <Field label="Last name" name="lastName" />

        <Field label="Email" name="email" type="email" placeholder="you@example.com" />
        <Field label="Mobile number" name="mobileNumber" placeholder="e.g. 07900111222" />

        <Field label="Gender" name="gender" placeholder="male / female" />
        <Field label="Birthday" name="dateOfBirth" type="date" />

        <Field label="Marriage Anniversary date (Optional)" name="anniversaryDate" type="date" />

        <Select
          label="Church unit"
          name="churchUnit"
          placeholder={
            churchUnits.length === 0
              ? "No church units available"
              : "Select a church unit..."
          }
          options={unitOptions}
          disabled={churchUnits.length === 0}
        />

        <Select
          label="Church leader"
          name="churchLeader"
          placeholder={
            leaders.length === 0 ? "No leaders available" : "Select a leader..."
          }
          options={leaderOptions}
          disabled={leaders.length === 0}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800">
          Submit
        </button>
      </div>

      <div className="text-xs text-slate-500">
        By submitting, you confirm these details belong to you and may be used by{" "}
        <span className="font-medium text-slate-700">{tenantName}</span> for church
        administration.
      </div>
    </form>
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
