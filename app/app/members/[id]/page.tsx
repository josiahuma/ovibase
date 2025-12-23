// ovibase/app/app/members/[id]/page.tsx
import Link from "next/link";
import type { Member } from "@prisma/client";
import { requireTenant } from "@/src/lib/guards";
import { prisma } from "@/src/lib/prisma";
import { deleteMember, updateMember } from "@/src/lib/members.actions";

export default async function MemberDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { tenant } = await requireTenant();

  const member = await prisma.member.findFirst({
    where: { id: params.id, tenantId: tenant.id },
  });

  if (!member) {
    return (
      <div className="space-y-4">
        <div className="text-xl font-semibold text-slate-900">
          Member not found
        </div>
        <Link
          className="text-sm text-slate-600 hover:text-slate-900 underline"
          href="/app/members"
        >
          Back to members
        </Link>
      </div>
    );
  }

  async function onUpdate(formData: FormData) {
    "use server";
    await updateMember(member.id, formData);
  }

  async function onDelete() {
    "use server";
    await deleteMember(member.id);
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
        <MemberFields member={member} />

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
          Tip: Keeping email and mobile updated helps with reminders and SMS messaging.
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

function MemberFields({ member }: { member: Member }) {
  const toDateValue = (d: Date | null) => {
    if (!d) return "";
    const iso = new Date(d).toISOString();
    return iso.slice(0, 10);
  };

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
      <Field
        label="Church unit"
        name="churchUnit"
        defaultValue={member.churchUnit || ""}
        placeholder="e.g. Choir, Youth, Media"
      />

      <Field
        label="Church leader"
        name="churchLeader"
        defaultValue={member.churchLeader || ""}
        placeholder="e.g. John Doe"
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
