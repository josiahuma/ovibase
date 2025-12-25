// app/app/settings/users/page.tsx
import Link from "next/link";
import { requireAdmin } from "@/src/lib/permissions";
import { prisma } from "@/src/lib/prisma";
import UsersForm from "./UsersForm";

export default async function UsersSettingsPage() {
  const { tenant } = await requireAdmin();

  const users = await prisma.userTenant.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      role: true,
      canMembers: true,
      canLeaders: true,
      canAttendance: true,
      canFinance: true,
      canSms: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Users & Permissions
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Create staff users and control what they can edit.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <UsersForm />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 font-medium text-slate-900">
          Current users
        </div>

        <div className="divide-y divide-slate-200">
          {users.map((u) => (
            <div
              key={u.id}
              className="px-5 py-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">
                  {u.user.name || u.user.email}
                </div>
                <div className="text-xs text-slate-500 truncate">{u.user.email}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Role:{" "}
                  <span className="font-medium text-slate-700">{u.role}</span>
                </div>

                <div className="mt-3">
                  <Link
                    href={`/app/settings/users/${u.id}`}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit permissions
                  </Link>
                </div>
              </div>

              <div className="text-xs text-slate-600 grid grid-cols-2 gap-x-4 gap-y-1">
                <Perm label="Members" ok={u.canMembers} />
                <Perm label="Leaders" ok={u.canLeaders} />
                <Perm label="Attendance" ok={u.canAttendance} />
                <Perm label="Finance" ok={u.canFinance} />
                <Perm label="SMS" ok={u.canSms} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Perm({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div>
      {label}:{" "}
      <span className={ok ? "text-emerald-700 font-medium" : "text-slate-400"}>
        {ok ? "Yes" : "No"}
      </span>
    </div>
  );
}
