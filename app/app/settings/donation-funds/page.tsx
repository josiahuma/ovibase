import Link from "next/link";
import { requireTenant } from "@/src/lib/guards";
import { prisma } from "@/src/lib/prisma";
import {
  createDonationFund,
  deleteDonationFund,
  setDefaultDonationFund,
} from "@/src/lib/donation-funds.actions";

type SearchParams = { ok?: string; error?: string };

export default async function DonationFundsPage(props: {
  searchParams: Promise<SearchParams> | SearchParams;
}) {
  const { tenant, session } = await requireTenant();
  const sp = (await (props.searchParams as any)) as SearchParams;

  const funds = await prisma.donationFund.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  const isAdmin = session.role === "OWNER" || session.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Donation Types
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage the Fund dropdown shown on your public donation page.
          </p>
        </div>

        <Link
          href="/app/settings"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to Settings
        </Link>
      </div>

      {(sp?.ok || sp?.error) && (
        <div
          className={[
            "rounded-xl border p-3 text-sm",
            sp?.error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700",
          ].join(" ")}
        >
          {sp?.error
            ? sp.error === "duplicate"
              ? "That donation type already exists."
              : "Please enter a valid name."
            : "Saved."}
        </div>
      )}

      {/* Add Fund */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-medium text-slate-900">Add a donation type</div>
        <p className="text-xs text-slate-500 mt-1">
          Funds are tenant-specific and appear on your donation page.
        </p>

        {!isAdmin ? (
          <div className="mt-4 text-sm text-slate-500">
            Only Owners/Admins can edit donation funds.
          </div>
        ) : (
          <form action={createDonationFund} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1">
                <div className="text-xs font-medium text-slate-600">Fund name</div>
                <input
                  name="name"
                  placeholder="e.g. General Church Fund"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                />
              </label>

              <label className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  name="isDefault"
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">
                  Set as default fund
                </span>
              </label>
            </div>

            <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800">
              Add Type
            </button>
          </form>
        )}
      </div>

      {/* Funds list */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="text-sm font-medium text-slate-900">Current donation types</div>
          <div className="text-xs text-slate-500 mt-1">
            Default fund appears preselected.
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {funds.length === 0 ? (
            <div className="px-5 py-10 text-sm text-slate-500">
              No funds yet. Add your first fund above.
            </div>
          ) : (
            funds.map((f) => (
              <div
                key={f.id}
                className="px-5 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-900">{f.name}</span>
                  {f.isDefault && (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-100">
                      Default
                    </span>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex gap-2">
                    {!f.isDefault && (
                      <form action={async () => { "use server"; await setDefaultDonationFund(f.id); }}>
                        <button className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                          Set Default
                        </button>
                      </form>
                    )}

                    <form action={async () => { "use server"; await deleteDonationFund(f.id); }}>
                      <button className="inline-flex items-center justify-center rounded-lg bg-red-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-red-700">
                        Delete
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
