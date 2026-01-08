"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { requireTenant } from "@/src/lib/guards";
import { z } from "zod";

function ensureAdminRole(role: string) {
  return role === "OWNER" || role === "ADMIN";
}

const FundSchema = z.object({
  name: z.string().trim().min(1).max(191),
  isDefault: z.string().optional(), // "on" if checked
});

export async function createDonationFund(formData: FormData) {
  const { session, tenant } = await requireTenant();
  if (!ensureAdminRole(session.role)) redirect("/app");

  const parsed = FundSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    isDefault: formData.get("isDefault") ? "on" : undefined,
  });

  if (!parsed.success) redirect("/app/settings/donation-funds?error=validation");

  const name = parsed.data.name;
  const makeDefault = parsed.data.isDefault === "on";

  // If setting default, unset any previous default for this tenant
  if (makeDefault) {
    await prisma.donationFund.updateMany({
      where: { tenantId: tenant.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  try {
    await prisma.donationFund.create({
      data: {
        tenantId: tenant.id,
        name,
        isDefault: makeDefault,
      },
    });
  } catch {
    redirect("/app/settings/donation-funds?error=duplicate");
  }

  revalidatePath("/app/settings/donation-funds");
  redirect("/app/settings/donation-funds?ok=created");
}

export async function setDefaultDonationFund(id: string) {
  const { session, tenant } = await requireTenant();
  if (!ensureAdminRole(session.role)) redirect("/app");

  // unset old default
  await prisma.donationFund.updateMany({
    where: { tenantId: tenant.id, isDefault: true },
    data: { isDefault: false },
  });

  // set new default (tenant-safe)
  await prisma.donationFund.updateMany({
    where: { id, tenantId: tenant.id },
    data: { isDefault: true },
  });

  revalidatePath("/app/settings/donation-funds");
  redirect("/app/settings/donation-funds?ok=default");
}

export async function deleteDonationFund(id: string) {
  const { session, tenant } = await requireTenant();
  if (!ensureAdminRole(session.role)) redirect("/app");

  await prisma.donationFund.deleteMany({
    where: { id, tenantId: tenant.id },
  });

  revalidatePath("/app/settings/donation-funds");
  redirect("/app/settings/donation-funds?ok=deleted");
}
