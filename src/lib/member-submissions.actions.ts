"use server";

import { prisma } from "@/src/lib/prisma";
import { requireTenant } from "@/src/lib/guards";
import { requirePermission } from "@/src/lib/permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

export async function approveMemberSubmission(submissionId: string) {
  const { tenant } = await requireTenant();
  await requirePermission("members");

  await prisma.$transaction(async (tx) => {
    const sub = await tx.memberSubmission.findFirst({
      where: { id: submissionId, tenantId: tenant.id },
    });

    if (!sub) throw new Error("Submission not found");
    if (sub.status !== "PENDING") return;

    // Safety: prevent duplicates at approval-time too
    const dup = await tx.member.findFirst({
      where: {
        tenantId: tenant.id,
        OR: [
          sub.mobileNumber ? { mobileNumber: sub.mobileNumber } : undefined,
          sub.email ? { email: sub.email } : undefined,
        ].filter(Boolean) as any,
      },
      select: { id: true },
    });

    if (dup) {
      // mark rejected so admin sees it isn't pending forever
      await tx.memberSubmission.update({
        where: { id: sub.id },
        data: {
          status: "REJECTED",
          rejectReason: "Duplicate record exists already.",
          reviewedAt: new Date(),
        },
      });
      return;
    }

    const created = await tx.member.create({
      data: {
        tenantId: tenant.id,
        firstName: sub.firstName,
        lastName: sub.lastName,
        gender: sub.gender,
        mobileNumber: sub.mobileNumber,
        email: sub.email,
        dateOfBirth: sub.dateOfBirth,
        anniversaryDate: sub.anniversaryDate,
        churchUnit: sub.churchUnit,
        churchLeader: sub.churchLeader,
      },
      select: { id: true },
    });

    await tx.memberSubmission.update({
      where: { id: sub.id },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        memberId: created.id,
      },
    });
  });

  revalidatePath("/app/members");
  revalidatePath("/app/members/submissions");
  redirect("/app/members/submissions?ok=approved");
}

export async function rejectMemberSubmission(submissionId: string, formData: FormData) {
  const { tenant } = await requireTenant();
  await requirePermission("members");

  const reason = s(formData.get("reason")) || null;

  await prisma.memberSubmission.updateMany({
    where: { id: submissionId, tenantId: tenant.id, status: "PENDING" },
    data: {
      status: "REJECTED",
      rejectReason: reason,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/app/members/submissions");
  redirect("/app/members/submissions?ok=rejected");
}
