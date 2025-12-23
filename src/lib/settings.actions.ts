"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { requireTenant } from "@/src/lib/guards";
import { z } from "zod";

function ensureAdminRole(role: string) {
  return role === "OWNER" || role === "ADMIN";
}

const NameSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(191, "Name is too long"),
});

const ChurchUnitSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(191, "Name is too long"),
  alias: z.string().trim().min(1, "Alias is required").max(191, "Alias is too long"),
});

/** EVENT CATEGORIES */

export async function createEventCategory(formData: FormData) {
  const { session, tenant } = await requireTenant();
  if (!ensureAdminRole(session.role)) redirect("/app");

  const parsed = NameSchema.safeParse({
    name: String(formData.get("name") ?? ""),
  });

  if (!parsed.success) {
    // Keep it simple: redirect back. You can add inline errors later.
    redirect("/app/settings/event-categories?error=validation");
  }

  const name = parsed.data.name;

  try {
    await prisma.eventCategory.create({
      data: {
        tenantId: tenant.id,
        name,
      },
    });
  } catch {
    // Likely unique constraint (tenantId + name)
    redirect("/app/settings/event-categories?error=duplicate");
  }

  revalidatePath("/app/settings/event-categories");
  redirect("/app/settings/event-categories");
}

export async function deleteEventCategory(id: string) {
  const { session, tenant } = await requireTenant();
  if (!ensureAdminRole(session.role)) redirect("/app");

  await prisma.eventCategory.deleteMany({
    where: { id, tenantId: tenant.id },
  });

  revalidatePath("/app/settings/event-categories");
  redirect("/app/settings/event-categories");
}

/** INCOME CATEGORIES */

export async function createIncomeCategory(formData: FormData) {
  const { session, tenant } = await requireTenant();
  if (!ensureAdminRole(session.role)) redirect("/app");

  const parsed = NameSchema.safeParse({
    name: String(formData.get("name") ?? ""),
  });

  if (!parsed.success) redirect("/app/settings/income-categories?error=validation");

  const name = parsed.data.name;

  try {
    await prisma.incomeCategory.create({
      data: { tenantId: tenant.id, name },
    });
  } catch {
    redirect("/app/settings/income-categories?error=duplicate");
  }

  revalidatePath("/app/settings/income-categories");
  redirect("/app/settings/income-categories");
}

export async function deleteIncomeCategory(id: string) {
  const { session, tenant } = await requireTenant();
  if (!ensureAdminRole(session.role)) redirect("/app");

  await prisma.incomeCategory.deleteMany({
    where: { id, tenantId: tenant.id },
  });

  revalidatePath("/app/settings/income-categories");
  redirect("/app/settings/income-categories");
}

/** EXPENSE CATEGORIES */

export async function createExpenseCategory(formData: FormData) {
  const { session, tenant } = await requireTenant();
  if (!ensureAdminRole(session.role)) redirect("/app");

  const parsed = NameSchema.safeParse({
    name: String(formData.get("name") ?? ""),
  });

  if (!parsed.success) redirect("/app/settings/expense-categories?error=validation");

  const name = parsed.data.name;

  try {
    await prisma.expenseCategory.create({
      data: { tenantId: tenant.id, name },
    });
  } catch {
    redirect("/app/settings/expense-categories?error=duplicate");
  }

  revalidatePath("/app/settings/expense-categories");
  redirect("/app/settings/expense-categories");
}

export async function deleteExpenseCategory(id: string) {
  const { session, tenant } = await requireTenant();
  if (!ensureAdminRole(session.role)) redirect("/app");

  await prisma.expenseCategory.deleteMany({
    where: { id, tenantId: tenant.id },
  });

  revalidatePath("/app/settings/expense-categories");
  redirect("/app/settings/expense-categories");
}

/** CHURCH UNIT CATEGORIES */

export async function createChurchUnitCategory(formData: FormData) {
  const { session, tenant } = await requireTenant();
  if (!ensureAdminRole(session.role)) redirect("/app");

  const parsed = ChurchUnitSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    alias: String(formData.get("alias") ?? ""),
  });

  if (!parsed.success) redirect("/app/settings/church-unit-categories?error=validation");

  const { name, alias } = parsed.data;

  try {
    await prisma.churchUnitCategory.create({
      data: { tenantId: tenant.id, name, alias },
    });
  } catch {
    redirect("/app/settings/church-unit-categories?error=duplicate");
  }

  revalidatePath("/app/settings/church-unit-categories");
  redirect("/app/settings/church-unit-categories");
}

export async function deleteChurchUnitCategory(id: string) {
  const { session, tenant } = await requireTenant();
  if (!ensureAdminRole(session.role)) redirect("/app");

  await prisma.churchUnitCategory.deleteMany({
    where: { id, tenantId: tenant.id },
  });

  revalidatePath("/app/settings/church-unit-categories");
  redirect("/app/settings/church-unit-categories");
}
