// ovibase/src/lib/members.actions.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { requireTenant } from "@/src/lib/guards";

function toStringOrNull(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function toDateOrNull(v: FormDataEntryValue | null): Date | null {
  if (!v) return null;
  const s = String(v).trim();
  if (!s) return null;

  // Expect YYYY-MM-DD from <input type="date">
  const d = new Date(`${s}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createMember(formData: FormData) {
  const { tenant } = await requireTenant();

  const firstName = toStringOrNull(formData.get("firstName"));
  const lastName = toStringOrNull(formData.get("lastName"));
  const gender = toStringOrNull(formData.get("gender"));

  const mobileNumber = toStringOrNull(formData.get("mobileNumber"));
  const email = toStringOrNull(formData.get("email"));

  const dateOfBirth = toDateOrNull(formData.get("dateOfBirth"));
  const anniversaryDate = toDateOrNull(formData.get("anniversaryDate"));

  const churchUnit = toStringOrNull(formData.get("churchUnit"));
  const churchLeader = toStringOrNull(formData.get("churchLeader"));

  if (!firstName) {
    throw new Error("First name is required.");
  }

  const created = await prisma.member.create({
    data: {
      tenantId: tenant.id,
      firstName,
      lastName,
      gender,
      mobileNumber,
      email,
      dateOfBirth,
      anniversaryDate,
      churchUnit,
      churchLeader,
    },
    select: { id: true },
  });

  revalidatePath("/app/members");
  redirect(`/app/members/${created.id}`);
}

export async function updateMember(memberId: string, formData: FormData) {
  const { tenant } = await requireTenant();

  const firstName = toStringOrNull(formData.get("firstName"));
  const lastName = toStringOrNull(formData.get("lastName"));
  const gender = toStringOrNull(formData.get("gender"));

  const mobileNumber = toStringOrNull(formData.get("mobileNumber"));
  const email = toStringOrNull(formData.get("email"));

  const dateOfBirth = toDateOrNull(formData.get("dateOfBirth"));
  const anniversaryDate = toDateOrNull(formData.get("anniversaryDate"));

  const churchUnit = toStringOrNull(formData.get("churchUnit"));
  const churchLeader = toStringOrNull(formData.get("churchLeader"));

  if (!firstName) {
    throw new Error("First name is required.");
  }

  // ✅ IMPORTANT: update only THIS member for THIS tenant
  const res = await prisma.member.updateMany({
    where: { id: memberId, tenantId: tenant.id },
    data: {
      firstName,
      lastName,
      gender,
      mobileNumber,
      email,
      dateOfBirth,
      anniversaryDate,
      churchUnit,
      churchLeader,
    },
  });

  if (res.count === 0) {
    throw new Error("Member not found or you don't have access.");
  }

  revalidatePath("/app/members");
  revalidatePath(`/app/members/${memberId}`);
  redirect(`/app/members/${memberId}`);
}

export async function deleteMember(memberId: string) {
  const { tenant } = await requireTenant();

  // ✅ tenant-safe delete
  await prisma.member.deleteMany({
    where: { id: memberId, tenantId: tenant.id },
  });

  revalidatePath("/app/members");
  redirect("/app/members");
}
