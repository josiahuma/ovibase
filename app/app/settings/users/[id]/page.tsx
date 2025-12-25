// app/app/settings/users/[id]/page.tsx
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { requireAdmin } from "@/src/lib/permissions";
import { updateUserTenantPermissions } from "@/src/lib/users.actions";
import type { UserRole } from "@prisma/client";

export default async function EditUserPermissionsPage(props: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const ctx = await requireAdmin();

  // ✅ Next 15 fix: params can be a Promise
  const params = await Promise.resolve(props.params);
  const userTenantId = params.id;

  const ut = await prisma.userTenant.findFirst({
    where: {
      id: userTenantId,
      tenantId: ctx.tenant.id,
    },
    select: {
      id: true,
      role: true,
      canMembers: true,
      canLeaders: true,
      canAttendance: true,
      canFinance: true,
      canSms: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!ut) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="text-xl font-semibold text-slate-900">User not found</div>
        <Link
          href="/app/settings/users"
          className="text-sm text-slate-600 hover:text-slate-900 underline"
        >
          Back to users
        </Link>
      </div>
    );
  }

  // Safety: only OWNER can edit OWNER accounts
  const isTargetOwner = ut.role === "OWNER";
  const isEditorOwner = ctx.role === "OWNER";
  const canEditThisUser = !isTargetOwner || isEditorOwner;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Edit user permissions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Update what this user can access in{" "}
            <span className="text-slate-900">{ctx.tenant.name}</span>.
          </p>

          <div className="text-sm text-slate-700 mt-3">
            <div className="font-medium">{ut.user.name || ut.user.email}</div>
            <div className="text-slate-500">{ut.user.email}</div>
          </div>
        </div>

        <Link
          href="/app/settings/users"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </Link>
      </div>

      {!canEditThisUser ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="font-medium text-slate-900">Restricted</div>
          <div className="text-sm text-slate-500 mt-1">
            Only an <span className="font-medium text-slate-700">OWNER</span> can edit an OWNER account.
          </div>
        </div>
      ) : (
        <form
          action={updateUserTenantPermissions}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5"
        >
          <input type="hidden" name="userTenantId" value={ut.id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Role"
              name="role"
              defaultValue={ut.role}
              options={[
                { value: "STAFF", label: "Staff" },
                { value: "VIEWER", label: "Viewer" },
                { value: "ADMIN", label: "Admin" },
                ...(ctx.role === "OWNER" ? [{ value: "OWNER", label: "Owner" }] : []),
              ]}
              helper="Admins/Owners have full access automatically."
            />

            <div className="sm:col-span-2 rounded-xl border border-slate-200 p-4">
              <div className="text-sm font-semibold text-slate-900">Permissions</div>
              <div className="text-xs text-slate-500 mt-1">
                Choose what this user can access. (Admins/Owners always have full access.)
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Checkbox name="canMembers" label="Members" defaultChecked={ut.canMembers} />
                <Checkbox name="canLeaders" label="Leaders" defaultChecked={ut.canLeaders} />
                <Checkbox name="canAttendance" label="Attendance" defaultChecked={ut.canAttendance} />
                <Checkbox name="canFinance" label="Finance" defaultChecked={ut.canFinance} />
                <Checkbox name="canSms" label="Dashboard / Bulk SMS" defaultChecked={ut.canSms} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Link
              href="/app/settings/users"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800">
              Save changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-slate-300"
      />
      {label}
    </label>
  );
}

function Select({
  label,
  name,
  defaultValue,
  options,
  helper,
}: {
  label: string;
  name: string;
  defaultValue: UserRole;
  options: { value: string; label: string }[];
  helper?: string;
}) {
  return (
    <label className="space-y-1">
      <div className="text-xs font-medium text-slate-600">{label}</div>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {helper ? <div className="text-xs text-slate-500">{helper}</div> : null}
    </label>
  );
}
