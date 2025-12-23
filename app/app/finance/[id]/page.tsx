import Link from "next/link";
import { requireTenant } from "@/src/lib/guards";
import { prisma } from "@/src/lib/prisma";
import { deleteFinance, updateFinance } from "@/src/lib/finance.actions";

export default async function FinanceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { tenant } = await requireTenant();

  const record = await prisma.finance.findFirst({
    where: { id: params.id, tenantId: tenant.id },
  });

  if (!record) {
    return (
      <div className="space-y-4">
        <div className="text-xl font-semibold text-slate-900">
          Finance record not found
        </div>
        <Link className="text-slate-700 underline" href="/app/finance">
          Back to finance
        </Link>
      </div>
    );
  }

  async function onUpdate(formData: FormData) {
    "use server";
    await updateFinance(record.id, formData);
  }

  async function onDelete() {
    "use server";
    await deleteFinance(record.id);
  }

  const toDateValue = (d: Date) => {
    const iso = new Date(d).toISOString();
    return iso.slice(0, 10);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Edit Finance Record
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Update or remove this entry.
          </p>
        </div>

        <Link
          href="/app/finance"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </Link>
      </div>

      {/* Edit form */}
      <form
        action={onUpdate}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Type"
            name="type"
            required
            placeholder="Select type..."
            defaultValue={record.type}
            options={[
              { value: "income", label: "Income" },
              { value: "expense", label: "Expense" },
            ]}
          />

          <Field
            label="Amount"
            name="amount"
            required
            defaultValue={Number(record.amount).toFixed(2)}
            inputMode="decimal"
          />

          <Field
            label="Date"
            name="date"
            type="date"
            required
            defaultValue={toDateValue(record.date)}
          />

          <Field
            label="Description"
            name="description"
            defaultValue={record.description ?? ""}
            placeholder="Optional note"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/app/finance"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800">
            Save Changes
          </button>
        </div>
      </form>

      {/* Delete */}
      <form action={onDelete}>
        <button className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
          Delete Record
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  defaultValue,
  inputMode,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="space-y-1">
      <div className="text-xs font-medium text-slate-600">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </div>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        inputMode={inputMode}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400"
      />
    </label>
  );
}

function Select({
  label,
  name,
  placeholder,
  options,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  placeholder: string;
  options: { value: string; label: string }[];
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="space-y-1">
      <div className="text-xs font-medium text-slate-600">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </div>

      <select
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
