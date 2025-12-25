// ovibase/app/app/members/%5Bid%5D/page.tsx
import Link from "next/link";
import type { Member } from "@prisma/client";
import { notFound } from "next/navigation";
import { requireTenant } from "@/src/lib/guards";
import { prisma } from "@/src/lib/prisma";
import { deleteMember, updateMember } from "@/src/lib/members.actions";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { tenant } = await requireTenant();
  const { id } = await params;

  const [member, leaders, churchUnits] = await Promise.all([
    prisma.member.findFirst({
      where: { id, tenantId: tenant.id },
    }),
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

  if (!member) notFound();

  async function onUpdate(formData: FormData) {
    "use server";
    await updateMember(id, formData);
  }

  async function onDelete() {
    "use server";
    await deleteMember(id);
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {member.firstName} {member.lastName || ""}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Edit member details.</p>
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
        action={onUpdate}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5"
      >
        <MemberFields member={member} leaders={leaders} churchUnits={churchUnits} />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/app/members"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800">
            Save Changes
          </button>
        </div>

        <div className="text-xs text-slate-500">
          Tip: Keeping email and mobile updated helps with reminders and SMS
          messaging.
        </div>
      </form>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="font-medium text-red-800">Danger zone</div>
            <div className="text-sm text-red-700 mt-1">
              Deleting a member permanently removes them from your workspace.
            </div>
          </div>

          <form action={onDelete}>
            <button className="inline-flex items-center justify-center rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700">
              Delete Member
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function MemberFields({
  member,
  leaders,
  churchUnits,
}: {
  member: Member;
  leaders: { id: string; firstName: string; lastName: string; churchUnit: string }[];
  churchUnits: { id: string; name: string; alias: string }[];
}) {
  const toDateValue = (d: Date | null) => {
    if (!d) return "";
    const iso = new Date(d).toISOString();
    return iso.slice(0, 10);
  };

  const unitOptions = churchUnits.map((u) => ({
    value: u.name,
    label: u.name,
    meta: u.alias ? `(${u.alias})` : "",
  }));

  const leaderOptions = leaders.map((l) => {
    const name = `${l.firstName} ${l.lastName}`.trim();
    return {
      value: name,
      label: name,
      meta: l.churchUnit ? `(${l.churchUnit})` : "",
    };
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field
        label="First name"
        name="firstName"
        defaultValue={member.firstName}
        required
      />
      <Field
        label="Last name"
        name="lastName"
        defaultValue={member.lastName || ""}
      />

      <Field
        label="Email"
        name="email"
        type="email"
        defaultValue={member.email || ""}
      />
      <Field
        label="Mobile number"
        name="mobileNumber"
        defaultValue={member.mobileNumber || ""}
        placeholder="e.g. 07900111222"
      />

      <Field
        label="Gender"
        name="gender"
        defaultValue={member.gender || ""}
        placeholder="male / female"
      />
      <Field
        label="Date of birth"
        name="dateOfBirth"
        type="date"
        defaultValue={toDateValue(member.dateOfBirth)}
      />

      <Field
        label="Anniversary date"
        name="anniversaryDate"
        type="date"
        defaultValue={toDateValue(member.anniversaryDate)}
      />

      {/* ✅ UPDATED: Church unit dropdown */}
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
        defaultValue={member.churchUnit || ""}
      />

      {/* ✅ UPDATED: Church leader dropdown */}
      <Select
        label="Church leader"
        name="churchLeader"
        placeholder={
          leaders.length === 0
            ? "No leaders yet — create a leader first"
            : "Select a leader..."
        }
        options={leaderOptions}
        disabled={leaders.length === 0}
        defaultValue={member.churchLeader || ""}
      />
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
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
        defaultValue={defaultValue}
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
  defaultValue,
}: {
  label: string;
  name: string;
  placeholder: string;
  options: { value: string; label: string; meta?: string }[];
  disabled?: boolean;
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
        disabled={disabled}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:bg-slate-100 disabled:text-slate-500"
      >
        <option value="">
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
