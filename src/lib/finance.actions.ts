// src/lib/finance.actions.ts
"use server";

import { prisma } from "@/src/lib/prisma";
import { requirePermission } from "@/src/lib/permissions";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

function required(v: string, label: string) {
  if (!v) throw new Error(`${label} is required.`);
  return v;
}

export async function createFinance(formData: FormData) {
  const { tenant } = await requirePermission("finance");

  const type = s(formData.get("type"));
  const category = s(formData.get("category"));
  const amountRaw = s(formData.get("amount"));
  const dateRaw = s(formData.get("date"));
  const description = s(formData.get("description")) || null;

  required(type, "Type");
  required(category, "Category");
  required(amountRaw, "Amount");
  required(dateRaw, "Date");

  if (type !== "income" && type !== "expense") {
    throw new Error("Type must be income or expense.");
  }

  const amount = Number(amountRaw);
  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error("Amount must be a valid number greater than 0.");
  }

  const date = new Date(dateRaw);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Date is invalid.");
  }

  await prisma.finance.create({
    data: {
      tenantId: tenant.id,
      type,
      category,
      amount,
      date,
      description,
    },
  });

  revalidatePath("/app/finance");
  revalidatePath("/app");

  redirect("/app/finance");
}
