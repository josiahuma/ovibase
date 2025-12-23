// ovibase/src/lib/eventCategories.actions.ts
"use server";

import { redirect } from "next/navigation";
import { requireTenant } from "@/src/lib/guards";
import { prisma } from "@/src/lib/prisma";

function str(v: FormDataEntryValue | null) {
  if (typeof v !== "string") return "";
  return v.trim();
}

export async function createEventCategory(formData: FormData) {
  const { tenant } = await requireTenant();
  const name = str(formData.get("name"));

  if (!name) throw new Error("Category name is required.");

  await prisma.eventCategory.create({
    data: {
      tenantId: tenant.id,
      name,
    },
  });

  redirect("/app/event-categories");
}

export async function deleteEventCategory(categoryId: string) {
  const { tenant } = await requireTenant();

  await prisma.eventCategory.deleteMany({
    where: { id: categoryId, tenantId: tenant.id },
  });

  redirect("/app/event-categories");
}
