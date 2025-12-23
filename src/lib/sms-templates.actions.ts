"use server";

import { prisma } from "@/src/lib/prisma";
import { requireAdmin } from "@/src/lib/guards";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function toString(v: FormDataEntryValue | null) {
  if (!v) return "";
  return String(v).trim();
}

export async function createSmsTemplate(formData: FormData) {
  const { tenant } = await requireAdmin();

  const name = toString(formData.get("name"));
  const message = toString(formData.get("message"));

  if (!name || !message) {
    throw new Error("Name and message are required.");
  }

  await prisma.smsTemplate.create({
    data: {
      tenantId: tenant.id,
      name,
      message,
    },
  });

  revalidatePath("/app/settings/sms-templates");
  redirect("/app/settings/sms-templates");
}

export async function deleteSmsTemplate(id: string) {
  const { tenant } = await requireAdmin();

  await prisma.smsTemplate.delete({
    where: { id, tenantId: tenant.id },
  });

  revalidatePath("/app/settings/sms-templates");
}
