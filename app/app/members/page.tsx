import Link from "next/link";
import type { Member } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";
import { requirePermission } from "@/src/lib/permissions";
import { requireTenantWithUserTenant, isAdminRole } from "@/src/lib/guards";
import { sendBulkSmsToAllMembers } from "@/src/lib/sms.actions";

type SearchParams = {
  q?: string;

  // banners
  sms?: "sent" | "partial";
  count?: string; // sms=sent
  sent?: string;  // sms=partial
  failed?: string; // sms=partial
  error?: string;
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { tenant, ut } = await requireTenantWithUserTenant();
  await requirePermission("members");

  const sp = await searchParams;
  const q = (sp.q ?? "").trim();

  const isAdmin = isAdminRole(ut.role);
  const canSms = isAdmin || ut.canSms;

  const members: Member[] = await prisma.member.findMany({
    where: {
      tenantId: tenant.id,
      ...(q
        ? {
            OR: [
              { firstName: { contains: q } },
              { lastName: { contains: q } },
              { email: { contains: q } },
              { mobileNumber: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // For the "Send to all" count (only those with mobile numbers)
  const membersWithMobileCount = await prisma.member.count({
    where: { tenantId: tenant.id, mobileNumber: { not: null } },
  });

  // Only fetch templates if the user can send SMS
  const templates = canSms
    ? await prisma.smsTemplate.findMany({
        where: { tenantId: tenant.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true },
        take: 200,
      })
    : [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Members
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, search and manage your members.
          </p>
        </div>

        <Link
          href="/app/members/new"
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-3 py-2 text-sm font-medium hover:bg-slate-800"
        >
          + Add Member
        </Link>
      </div>

      {/* ✅ Banner (success/partial/error) */}
      {sp.error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          {sp.error}
        </div>
      ) : null}

      {sp.sms === "sent" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
          ✅ SMS sent successfully to{" "}
          <span className="font-semibold">{sp.count ?? "0"}</span> member(s).
        </div>
      ) : null}

      {sp.sms === "partial" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
          ⚠️ SMS partially sent — Sent:{" "}
          <span className="font-semibold">{sp.sent ?? "0"}</span>, Failed:{" "}
          <span className="font-semibold">{sp.failed ?? "0"}</span>.
        </div>
      ) : null}

      {/* ✅ Your existing search form (UNCHANGED) */}
      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name, email or phone..."
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400"
        />
        <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Search
        </button>
      </form>

      {/* ✅ NEW: Bulk SMS card (matches your design language) */}
      {canSms ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="font-semibold text-slate-900">Send Bulk SMS</div>
              <div className="text-sm text-slate-500 mt-1">
                Send a template message to all members with a mobile number (e.g.
                Sunday service reminder).
              </div>
            </div>

            <div className="text-sm text-slate-600">
              Recipients:{" "}
              <span className="font-semibold text-slate-900">
                {membersWithMobileCount}
              </span>
            </div>
          </div>

          {templates.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              No SMS templates yet. Create one in{" "}
              <Link
                href="/app/settings/sms-templates"
                className="underline font-medium"
              >
                Admin Settings → SMS Templates
              </Link>
              .
            </div>
          ) : (
            <form
              action={sendBulkSmsToAllMembers}
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <label className="w-full sm:flex-1 space-y-1">
                <div className="text-xs font-medium text-slate-600">
                  SMS Template
                </div>
                <select
                  name="templateId"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                >
                  <option value="">Choose a template...</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>

              <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800">
                Send to all
              </button>
            </form>
          )}

          <div className="text-xs text-slate-500">
            Tip: Only members with a saved mobile number will receive the SMS.
          </div>
        </div>
      ) : null}

      {/* ✅ Your existing table (UNCHANGED) */}
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Email</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">
                Mobile
              </th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">
                Unit
              </th>
              <th className="text-right px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {members.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={5}>
                  No members found.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {m.firstName} {m.lastName || ""}
                    </div>
                    <div className="text-xs text-slate-500 md:hidden">
                      {m.email || "—"} • {m.mobileNumber || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-700">
                    {m.email || "—"}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-700">
                    {m.mobileNumber || "—"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-slate-700">
                    {m.churchUnit || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/app/members/${m.id}`}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View / Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
