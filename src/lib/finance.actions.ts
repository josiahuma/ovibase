"use server";

import { prisma } from "@/src/lib/prisma";
import { requireTenant } from "@/src/lib/guards";
import { requirePermission } from "@/src/lib/permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

function n(v: FormDataEntryValue | null) {
  const raw = String(v ?? "").trim();
  if (!raw) return 0;
  const num = Number(raw);
  return Number.isFinite(num) ? num : 0;
}

function dt(v: FormDataEntryValue | null) {
  const raw = String(v ?? "").trim();
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * CREATE finance record
 * Expects fields:
 * - type (income|expense)
 * - amount
 * - category (optional string)
 * - notes/description (optional string)  (we’ll store as "note")
 * - date (optional)
 */
export async function createFinance(formData: FormData) {
  const ctx = await requirePermission("finance");

  const type = s(formData.get("type")).toLowerCase();
  const amount = n(formData.get("amount"));
  const category = s(formData.get("category"));
  const note = s(formData.get("note")) || s(formData.get("description"));
  const date = dt(formData.get("date")) ?? new Date();

  if (type !== "income" && type !== "expense") {
    redirect("/app/finance/new?error=Invalid type");
  }

  if (!amount || amount <= 0) {
    redirect("/app/finance/new?error=Amount must be greater than 0");
  }

  await prisma.finance.create({
    data: {
      tenantId: ctx.tenant.id,
      type,
      amount,
      category: category || null,
      note: note || null,
      date,
    } as any, // keeps this file tolerant if your Finance model differs slightly
  });

  revalidatePath("/app/finance");
  redirect("/app/finance?ok=created");
}

/**
 * UPDATE finance record
 */
export async function updateFinance(id: string, formData: FormData) {
  const { tenant } = await requireTenant();
  await requirePermission("finance");

  const type = s(formData.get("type")).toLowerCase();
  const amount = n(formData.get("amount"));
  const category = s(formData.get("category"));
  const note = s(formData.get("note")) || s(formData.get("description"));
  const date = dt(formData.get("date"));

  if (type !== "income" && type !== "expense") {
    redirect(`/app/finance/${id}?error=Invalid type`);
  }

  if (!amount || amount <= 0) {
    redirect(`/app/finance/${id}?error=Amount must be greater than 0`);
  }

  // ensure it belongs to tenant, then update
  const existing = await prisma.finance.findFirst({
    where: { id, tenantId: tenant.id },
    select: { id: true },
  });

  if (!existing) redirect("/app/finance?error=Record not found");

  await prisma.finance.update({
    where: { id },
    data: {
      type,
      amount,
      category: category || null,
      note: note || null,
      ...(date ? { date } : {}),
    } as any,
  });

  revalidatePath("/app/finance");
  revalidatePath(`/app/finance/${id}`);
  redirect(`/app/finance/${id}?ok=updated`);
}

/**
 * DELETE finance record
 */
export async function deleteFinance(id: string) {
  const { tenant } = await requireTenant();
  await requirePermission("finance");

  await prisma.finance.deleteMany({
    where: { id, tenantId: tenant.id },
  });

  revalidatePath("/app/finance");
  redirect("/app/finance?ok=deleted");
}
