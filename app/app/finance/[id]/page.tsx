import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireTenant } from "@/src/lib/guards";
import { prisma } from "@/src/lib/prisma";
import { deleteFinance, updateFinance } from "@/src/lib/finance.actions";

export default async function FinanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { tenant } = await requireTenant();
  const { id } = await params;

  const record = await prisma.finance.findFirst({
    where: { id, tenantId: tenant.id },
    select: {
      id: true,
      tenantId: true,
      type: true,
      amount: true,
      category: true,
      description: true,
      date: true,
      donationId: true, // ✅ lock flag
      donation: {
        select: {
          id: true,
          status: true,
          donorName: true,
          donorEmail: true,
          currency: true,
          amount: true,
          paidAt: true,
        },
      },
    },
  });

  if (!record) notFound();

  const locked = !!record.donationId;

  async function onUpdate(formData: FormData) {
    "use server";
    await updateFinance(id, formData);
  }

  async function onDelete() {
    "use server";
    await deleteFinance(id);
  }

  const toDateValue = (d: Date | null | undefined) => {
    if (!d) return "";
    return new Date(d).toISOString().slice(0, 10);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Finance Record
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {locked ? "This record is locked." : "Edit finance details."}
          </p>
        </div>

        <Link
          href="/app/finance"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </Link>
      </div>

      {/* Locked banner */}
      {locked && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-sm font-medium text-amber-800">
            Locked (Stripe donation)
          </div>
          <div className="mt-1 text-sm text-amber-800/90">
            This finance record was created automatically from a Stripe donation
            payment and cannot be edited or deleted.
          </div>

          {record.donation && (
            <div className="mt-3 text-sm text-amber-900">
              <div className="font-medium">Donation details</div>
              <div className="mt-1 text-amber-900/90">
                Status:{" "}
                <span className="font-medium">{record.donation.status}</span>
                {" • "}
                Amount:{" "}
                <span className="font-medium">
                  {record.donation.currency.toUpperCase()}{" "}
                  {String(record.donation.amount)}
                </span>
                {record.donation.donorName
                  ? ` • Donor: ${record.donation.donorName}`
                  : ""}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <form
        action={onUpdate}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Type</div>
            <select
              name="type"
              defaultValue={record.type ?? "income"}
              disabled={locked}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
              required
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>

          <label className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Amount</div>
            <input
              name="amount"
              type="number"
              step="0.01"
              defaultValue={String(record.amount ?? "")}
              disabled={locked}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
              required
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Category</div>
            <input
              name="category"
              defaultValue={String(record.category ?? "")}
              placeholder="e.g. Offering, Transport"
              disabled={locked}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Date</div>
            <input
              name="date"
              type="date"
              defaultValue={toDateValue(record.date)}
              disabled={locked}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </label>

          <label className="space-y-1 sm:col-span-2">
            <div className="text-xs font-medium text-slate-600">Note</div>
            <textarea
              name="note"
              rows={3}
              defaultValue={String(record.description ?? "")} // ✅ use description
              placeholder="Optional note..."
              disabled={locked}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/app/finance"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {locked ? "Back" : "Cancel"}
          </Link>

          {!locked && (
            <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800">
              Save Changes
            </button>
          )}
        </div>
      </form>

      {/* Danger zone (hide when locked) */}
      {!locked && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="font-medium text-red-800">Danger zone</div>
              <div className="text-sm text-red-700 mt-1">
                Deleting this finance record is permanent.
              </div>
            </div>

            <form action={onDelete}>
              <button className="inline-flex items-center justify-center rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700">
                Delete Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
