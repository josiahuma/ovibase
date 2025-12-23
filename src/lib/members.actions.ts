"use server";

import { prisma } from "@/src/lib/prisma";
import { requireTenant } from "@/src/lib/guards";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function toStringOrNull(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function toDateOrNull(v: FormDataEntryValue | null): Date | null {
  const s = toStringOrNull(v);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Next redirect() throws a special internal error.
 * If you catch it and treat it like a normal error, you'll see terminal noise
 * even though everything is working.
 */
function isNextRedirectError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as any).digest === "string" &&
    (err as any).digest.includes("NEXT_REDIRECT")
  );
}

export async function createMember(formData: FormData) {
  const { tenant } = await requireTenant();

  const firstName = toStringOrNull(formData.get("firstName"));
  const lastName = toStringOrNull(formData.get("lastName"));
  const email = toStringOrNull(formData.get("email"));
  const mobileNumber = toStringOrNull(formData.get("mobileNumber"));
  const gender = toStringOrNull(formData.get("gender"));
  const dateOfBirth = toDateOrNull(formData.get("dateOfBirth"));
  const anniversaryDate = toDateOrNull(formData.get("anniversaryDate"));
  const churchUnit = toStringOrNull(formData.get("churchUnit"));
  const churchLeader = toStringOrNull(formData.get("churchLeader"));

  if (!firstName) {
    throw new Error("First name is required.");
  }

  try {
    await prisma.member.create({
      data: {
        tenantId: tenant.id,
        firstName,
        lastName,
        email,
        mobileNumber,
        gender,
        dateOfBirth,
        anniversaryDate,
        churchUnit,
        churchLeader,
      },
    });

    revalidatePath("/app/members");
    redirect("/app/members");
  } catch (err) {
    // IMPORTANT: never treat redirect as a real error
    if (isNextRedirectError(err)) throw err;
    throw err;
  }
}

export async function updateMember(memberId: string, formData: FormData) {
  const { tenant } = await requireTenant();

  const firstName = toStringOrNull(formData.get("firstName"));
  const lastName = toStringOrNull(formData.get("lastName"));
  const email = toStringOrNull(formData.get("email"));
  const mobileNumber = toStringOrNull(formData.get("mobileNumber"));
  const gender = toStringOrNull(formData.get("gender"));
  const dateOfBirth = toDateOrNull(formData.get("dateOfBirth"));
  const anniversaryDate = toDateOrNull(formData.get("anniversaryDate"));
  const churchUnit = toStringOrNull(formData.get("churchUnit"));
  const churchLeader = toStringOrNull(formData.get("churchLeader"));

  if (!firstName) {
    throw new Error("First name is required.");
  }

  await prisma.member.update({
    where: {
      id: memberId,
      tenantId: tenant.id,
    },
    data: {
      firstName,
      lastName,
      email,
      mobileNumber,
      gender,
      dateOfBirth,
      anniversaryDate,
      churchUnit,
      churchLeader,
    },
  });

  revalidatePath("/app/members");
  revalidatePath(`/app/members/${memberId}`);
  redirect(`/app/members/${memberId}`);
}

export async function deleteMember(memberId: string) {
  const { tenant } = await requireTenant();

  await prisma.member.delete({
    where: {
      id: memberId,
      tenantId: tenant.id,
    },
  });

  revalidatePath("/app/members");
  redirect("/app/members");
}
