// ovibase/src/lib/leaders.actions.ts
"use server";

import { redirect } from "next/navigation";
import { requireTenant } from "@/src/lib/guards";
import { prisma } from "@/src/lib/prisma";

function normalizeStr(v: FormDataEntryValue | null) {
  if (typeof v !== "string") return "";
  return v.trim();
}

export async function createLeader(formData: FormData) {
  const { tenant } = await requireTenant();

  const firstName = normalizeStr(formData.get("firstName"));
  const lastName = normalizeStr(formData.get("lastName"));
  const email = normalizeStr(formData.get("email"));
  const mobileNumber = normalizeStr(formData.get("mobileNumber"));
  const churchUnit = normalizeStr(formData.get("churchUnit"));

  if (!firstName) throw new Error("First name is required.");
  if (!lastName) throw new Error("Last name is required.");
  if (!email) throw new Error("Email is required.");
  if (!mobileNumber) throw new Error("Mobile number is required.");
  if (!churchUnit) throw new Error("Church unit is required.");

  await prisma.leader.create({
    data: {
      tenantId: tenant.id,
      firstName,
      lastName,
      email,
      mobileNumber,
      churchUnit,
      membersCount: 0,
    },
  });

  redirect("/app/leaders");
}

export async function updateLeader(leaderId: string, formData: FormData) {
  const { tenant } = await requireTenant();

  const firstName = normalizeStr(formData.get("firstName"));
  const lastName = normalizeStr(formData.get("lastName"));
  const email = normalizeStr(formData.get("email"));
  const mobileNumber = normalizeStr(formData.get("mobileNumber"));
  const churchUnit = normalizeStr(formData.get("churchUnit"));

  if (!firstName) throw new Error("First name is required.");
  if (!lastName) throw new Error("Last name is required.");
  if (!email) throw new Error("Email is required.");
  if (!mobileNumber) throw new Error("Mobile number is required.");
  if (!churchUnit) throw new Error("Church unit is required.");

  await prisma.leader.updateMany({
    where: { id: leaderId, tenantId: tenant.id },
    data: {
      firstName,
      lastName,
      email,
      mobileNumber,
      churchUnit,
    },
  });

  redirect(`/app/leaders/${leaderId}`);
}

export async function deleteLeader(leaderId: string) {
  const { tenant } = await requireTenant();

  await prisma.leader.deleteMany({
    where: { id: leaderId, tenantId: tenant.id },
  });

  redirect("/app/leaders");
}
