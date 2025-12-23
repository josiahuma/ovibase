import Link from "next/link";
import type { Member } from "@prisma/client";
import { requireTenant } from "@/src/lib/guards";
import { prisma } from "@/src/lib/prisma";

type SearchParams = {
  q?: string;
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { tenant } = await requireTenant();

  const sp = await searchParams;
  const q = (sp.q ?? "").trim();

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
