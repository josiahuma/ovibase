"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createFinance } from "@/src/lib/finance.actions";

type Category = { id: string; name: string };

export default function FinanceNewForm({
  incomeCategories,
  expenseCategories,
}: {
  incomeCategories: Category[];
  expenseCategories: Category[];
}) {
  const [type, setType] = useState<"" | "income" | "expense">("");
  const [category, setCategory] = useState<string>("");

  const options = useMemo(() => {
    if (type === "income") return incomeCategories;
    if (type === "expense") return expenseCategories;
    return [];
  }, [type, incomeCategories, expenseCategories]);

  // When type changes, clear category so you can't submit an old category.
  useEffect(() => {
    setCategory("");
  }, [type]);

  const categoryPlaceholder =
    type === ""
      ? "Choose a type first..."
      : options.length === 0
        ? `No ${type} categories yet — add one in Admin Settings`
        : `Select a ${type} category...`;

  const categoryDisabled = type === "" || options.length === 0;

  return (
    <form
      action={createFinance}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Type"
          name="type"
          required
          value={type}
          onChange={setType}
          options={[
            { value: "income", label: "Income" },
            { value: "expense", label: "Expense" },
          ]}
          placeholder="Select type..."
        />

        <Select
          label="Category"
          name="category"
          required
          value={category}
          onChange={setCategory}
          disabled={categoryDisabled}
          options={options.map((c) => ({ value: c.name, label: c.name }))}
          placeholder={categoryPlaceholder}
        />

        <Field
          label="Amount"
          name="amount"
          required
          placeholder="e.g. 25.00"
          inputMode="decimal"
        />

        <Field label="Date" name="date" type="date" required />

        <Field
          label="Description"
          name="description"
          placeholder="Optional note (e.g. Offering, Rent, Transport...)"
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
          Save Record
        </button>
      </div>

      <div className="text-xs text-slate-500">
        Tip: Categories make reports cleaner and faster.
      </div>
    </form>
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
  value,
  onChange,
  disabled,
}: {
  label: string;
  name: string;
  placeholder: string;
  options: { value: string; label: string }[];
  required?: boolean;
  value: string;
  onChange: (value: any) => void;
  disabled?: boolean;
}) {
  return (
    <label className="space-y-1">
      <div className="text-xs font-medium text-slate-600">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </div>

      <select
        name={name}
        required={required}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:bg-slate-100 disabled:text-slate-500"
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
