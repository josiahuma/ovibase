"use client";

import { createStaffUser } from "@/src/lib/users.actions";

export default function UsersForm() {
  return (
    <form action={createStaffUser} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <div className="text-xs font-medium text-slate-600">Full name</div>
          <input
            name="name"
            placeholder="e.g. Jane Doe"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs font-medium text-slate-600">Email</div>
          <input
            name="email"
            type="email"
            required
            placeholder="e.g. staff@church.com"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs font-medium text-slate-600">Temporary password</div>
          <input
            name="password"
            type="password"
            required
            placeholder="Set a password"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs font-medium text-slate-600">Role</div>
          <select
            name="role"
            defaultValue="STAFF"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          >
            <option value="STAFF">Staff</option>
            <option value="VIEWER">Viewer</option>
          </select>
        </label>
      </div>

      <div className="rounded-lg border border-slate-200 p-4">
        <div className="text-sm font-medium text-slate-900">Permissions</div>
        <div className="text-xs text-slate-500 mt-1">
          Choose what this user can edit. (Admins/Owners always have full access.)
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Check name="canMembers" label="Members" />
          <Check name="canLeaders" label="Leaders" />
          <Check name="canAttendance" label="Attendance" />
          <Check name="canFinance" label="Finance" />
          <Check name="canSms" label="Dashboard / Bulk SMS" />
        </div>
      </div>

      <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800">
        Create User
      </button>

      <div className="text-xs text-slate-500">
        Tip: Later we can add a “force reset password on first login”.
      </div>
    </form>
  );
}

function Check({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input type="checkbox" name={name} className="h-4 w-4" />
      {label}
    </label>
  );
}
