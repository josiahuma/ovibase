"use server";

import { prisma } from "@/src/lib/prisma";
import { getTenantFromRequest } from "@/src/lib/tenant";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function toStringOrNull(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function toDateOrNull(v: FormDataEntryValue | null): Date | null {
  if (!v) return null;
  const s = String(v).trim();
  if (!s) return null;
  const d = new Date(`${s}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function publicJoinMember(formData: FormData) {
  const tenant = await getTenantFromRequest();
  if (!tenant) redirect("/");

  // honeypot anti-bot
  const company = toStringOrNull(formData.get("company"));
  if (company) redirect("/join?ok=1");

  const firstName = toStringOrNull(formData.get("firstName"));
  const lastName = toStringOrNull(formData.get("lastName"));
  const gender = toStringOrNull(formData.get("gender"));

  const mobileNumber = toStringOrNull(formData.get("mobileNumber"));
  const email = toStringOrNull(formData.get("email"));

  const dateOfBirth = toDateOrNull(formData.get("dateOfBirth"));
  const anniversaryDate = toDateOrNull(formData.get("anniversaryDate"));

  const churchUnit = toStringOrNull(formData.get("churchUnit"));
  const churchLeader = toStringOrNull(formData.get("churchLeader"));

  if (!firstName) redirect("/join?error=First name is required");
  if (!mobileNumber && !email) {
    redirect("/join?error=Please provide at least a mobile number or email");
  }

  // Prevent duplicate in REAL members
  const existingMember = await prisma.member.findFirst({
    where: {
      tenantId: tenant.id,
      OR: [
        mobileNumber ? { mobileNumber } : undefined,
        email ? { email } : undefined,
      ].filter(Boolean) as any,
    },
    select: { id: true },
  });

  if (existingMember) {
    redirect("/join?error=You already exist in our records. Please contact the admin if you need changes.");
  }

  // Prevent duplicate pending submissions
  const existingSubmission = await prisma.memberSubmission.findFirst({
    where: {
      tenantId: tenant.id,
      status: "PENDING",
      OR: [
        mobileNumber ? { mobileNumber } : undefined,
        email ? { email } : undefined,
      ].filter(Boolean) as any,
    },
    select: { id: true },
  });

  if (existingSubmission) {
    redirect("/join?error=Your submission is already pending approval. Please wait for confirmation.");
  }

  await prisma.memberSubmission.create({
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

  // Admin inbox might show counts
  revalidatePath("/app/members/submissions");

  redirect("/join?ok=1");
}
