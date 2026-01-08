import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getTenantFromRequest } from "@/src/lib/tenant";
import JoinMemberForm from "./JoinMemberForm";

type SearchParams = { ok?: string; error?: string };

export default async function JoinPage(props: {
  searchParams: Promise<SearchParams> | SearchParams;
}) {
  const tenant = await getTenantFromRequest();
  if (!tenant) redirect("/");

  const sp = (await (props.searchParams as any)) as SearchParams;

  const [leaders, churchUnits] = await Promise.all([
    prisma.leader.findMany({
      where: { tenantId: tenant.id },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      select: { firstName: true, lastName: true, churchUnit: true },
      take: 500,
    }),
    prisma.churchUnitCategory.findMany({
      where: { tenantId: tenant.id },
      orderBy: [{ name: "asc" }],
      select: { name: true, alias: true },
      take: 500,
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <div className="text-xs font-medium text-slate-500">WELCOME</div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Join {tenant.name}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Fill this form to add yourself to our members list.
        </p>
      </div>

      {sp?.ok && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Thanks! Your details have been submitted successfully.
        </div>
      )}

      {sp?.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {decodeURIComponent(sp.error)}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <JoinMemberForm
          tenantName={tenant.name}
          leaders={leaders}
          churchUnits={churchUnits}
        />
      </div>

      <div className="text-xs text-slate-500">
        Tip: Your details are only visible to the administrators of {tenant.name}.
      </div>
    </div>
  );
}
