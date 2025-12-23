"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";
import { requireTenant } from "@/src/lib/guards";

function toDateOrNull(v: FormDataEntryValue | null): Date | null {
  if (!v) return null;
  const s = String(v).trim();
  if (!s) return null;
  const d = new Date(s + "T00:00:00.000Z");
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function toStringOrNull(v: FormDataEntryValue | null): string | null {
  if (!v) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function normalizeType(v: FormDataEntryValue | null): "income" | "expense" | null {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "income" || s === "expense") return s;
  return null;
}

function normalizeAmount(v: FormDataEntryValue | null): Prisma.Decimal | null {
  const s = String(v ?? "").trim();
  if (!s) return null;

  const cleaned = s.replace(/,/g, "");
  const num = Number(cleaned);
  if (!Number.isFinite(num)) return null;
  if (num < 0) return null;

  return new Prisma.Decimal(num.toFixed(2));
}

export async function createFinance(formData: FormData) {
  const { tenant } = await requireTenant();

  const type = normalizeType(formData.get("type"));
  const amount = normalizeAmount(formData.get("amount"));
  const date = toDateOrNull(formData.get("date"));
  const description = toStringOrNull(formData.get("description"));
  const category = toStringOrNull(formData.get("category"));

  if (!type) throw new Error("Type is required (income or expense).");
  if (!amount) throw new Error("Amount is required and must be a valid number.");
  if (!date) throw new Error("Date is required.");
  if (!category) throw new Error("Category is required.");

  await prisma.finance.create({
    data: {
      tenantId: tenant.id,
      type,
      amount,
      date,
      category,
      description,
    },
  });

  revalidatePath("/app/finance");
  redirect("/app/finance");
}

export async function updateFinance(id: string, formData: FormData) {
  const { tenant } = await requireTenant();

  const existing = await prisma.finance.findFirst({
    where: { id, tenantId: tenant.id },
    select: { id: true },
  });

  if (!existing) throw new Error("Finance record not found.");

  const type = normalizeType(formData.get("type"));
  const amount = normalizeAmount(formData.get("amount"));
  const date = toDateOrNull(formData.get("date"));
  const description = toStringOrNull(formData.get("description"));
  const category = toStringOrNull(formData.get("category"));

  if (!type) throw new Error("Type is required (income or expense).");
  if (!amount) throw new Error("Amount is required and must be a valid number.");
  if (!date) throw new Error("Date is required.");
  if (!category) throw new Error("Category is required.");

  await prisma.finance.update({
    where: { id },
    data: {
      type,
      amount,
      date,
      category,
      description,
    },
  });

  revalidatePath("/app/finance");
  revalidatePath(`/app/finance/${id}`);
  redirect("/app/finance");
}

export async function deleteFinance(id: string) {
  const { tenant } = await requireTenant();

  const existing = await prisma.finance.findFirst({
    where: { id, tenantId: tenant.id },
    select: { id: true },
  });

  if (!existing) throw new Error("Finance record not found.");

  await prisma.finance.delete({ where: { id } });

  revalidatePath("/app/finance");
  redirect("/app/finance");
}
