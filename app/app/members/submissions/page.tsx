import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { requireTenant } from "@/src/lib/guards";
import { requirePermission } from "@/src/lib/permissions";
import { approveMemberSubmission, rejectMemberSubmission } from "@/src/lib/member-submissions.actions";

type SearchParams = { ok?: string };

export default async function MemberSubmissionsPage(props: {
  searchParams: Promise<SearchParams> | SearchParams;
}) {
  const { tenant } = await requireTenant();
  await requirePermission("members");

  const sp = (await (props.searchParams as any)) as SearchParams;

  const submissions = await prisma.memberSubmission.findMany({
    where: { tenantId: tenant.id, status: "PENDING" },
    orderBy: [{ createdAt: "desc" }],
    take: 300,
  });

  const formatDate = (d: Date) => new Date(d).toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Member Submissions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Approve or reject members who submitted the public join form.
          </p>
        </div>

        <Link
          href="/app/members"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to Members
        </Link>
      </div>

      {sp?.ok === "approved" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Submission approved and member created.
        </div>
      )}
      {sp?.ok === "rejected" && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Submission rejected.
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Submitted</th>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Contact</th>
                <th className="text-left px-4 py-3 font-medium">Unit / Leader</th>
                <th className="text-right px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    No pending submissions.
                  </td>
                </tr>
              ) : (
                submissions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {formatDate(s.createdAt)}
                    </td>

                    <td className="px-4 py-3 text-slate-900 font-medium">
                      {s.firstName} {s.lastName ?? ""}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      <div className="space-y-1">
                        <div>{s.mobileNumber ?? <span className="text-slate-400">—</span>}</div>
                        <div className="text-xs text-slate-500">{s.email ?? ""}</div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      <div className="space-y-1">
                        <div>{s.churchUnit ?? <span className="text-slate-400">—</span>}</div>
                        <div className="text-xs text-slate-500">{s.churchLeader ?? ""}</div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <form
                          action={async () => {
                            "use server";
                            await approveMemberSubmission(s.id);
                          }}
                        >
                          <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800">
                            Approve
                          </button>
                        </form>

                        <form
                          action={async (fd: FormData) => {
                            "use server";
                            await rejectMemberSubmission(s.id, fd);
                          }}
                          className="flex items-center gap-2"
                        >
                          <input
                            name="reason"
                            placeholder="Reason (optional)"
                            className="hidden md:block w-44 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-slate-400"
                          />
                          <button className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                            Reject
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-slate-500">
        Tip: Share this link with your members:{" "}
        <span className="font-medium text-slate-700">/join</span> (on your church subdomain).
      </div>
    </div>
  );
}
