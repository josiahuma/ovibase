// src/lib/users.actions.ts
"use server";

import { prisma } from "@/src/lib/prisma";
import { requireAdmin } from "@/src/lib/permissions";
import { hashPassword } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";

function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

function isChecked(v: FormDataEntryValue | null) {
  return v === "on" || v === "true" || v === "1";
}

export async function createStaffUser(formData: FormData) {
  const { tenant } = await requireAdmin();

  const name = s(formData.get("name")) || null;
  const email = s(formData.get("email")).toLowerCase();
  const password = s(formData.get("password"));
  const role = (s(formData.get("role")) || "STAFF") as UserRole;

  if (!email) throw new Error("Email is required.");
  if (!password) throw new Error("Password is required.");

  // ✅ Prevent duplicate user in SAME tenant by email
  const existingInTenant = await prisma.userTenant.findFirst({
    where: {
      tenantId: tenant.id,
      user: { email },
    },
    select: { id: true },
  });

  if (existingInTenant) {
    throw new Error(
      "A user with this email already exists in this tenant. Use Edit permissions instead."
    );
  }

  const passwordHash = await hashPassword(password);

  // Create user globally if doesn't exist
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name, passwordHash },
    update: { name: name ?? undefined },
    select: { id: true },
  });

  // Attach user to tenant with permissions (create only)
  await prisma.userTenant.create({
    data: {
      userId: user.id,
      tenantId: tenant.id,
      role,

      canMembers: isChecked(formData.get("canMembers")),
      canLeaders: isChecked(formData.get("canLeaders")),
      canAttendance: isChecked(formData.get("canAttendance")),
      canFinance: isChecked(formData.get("canFinance")),
      canSms: isChecked(formData.get("canSms")),
    },
  });

  revalidatePath("/app/settings/users");
}

export async function updateUserTenantPermissions(formData: FormData) {
  const ctx = await requireAdmin();

  const userTenantId = s(formData.get("userTenantId"));
  const role = (s(formData.get("role")) || "STAFF") as UserRole;

  if (!userTenantId) throw new Error("Missing userTenantId.");

  const existing = await prisma.userTenant.findFirst({
    where: { id: userTenantId, tenantId: ctx.tenant.id },
    select: { id: true, role: true },
  });

  if (!existing) throw new Error("User not found for this tenant.");

  if (existing.role === "OWNER" && ctx.role !== "OWNER") {
    throw new Error("Only an OWNER can edit an OWNER account.");
  }

  await prisma.userTenant.update({
    where: { id: userTenantId },
    data: {
      role,
      canMembers: isChecked(formData.get("canMembers")),
      canLeaders: isChecked(formData.get("canLeaders")),
      canAttendance: isChecked(formData.get("canAttendance")),
      canFinance: isChecked(formData.get("canFinance")),
      canSms: isChecked(formData.get("canSms")),
    },
  });

  revalidatePath("/app/settings/users");
  revalidatePath(`/app/settings/users/${userTenantId}`);

  redirect("/app/settings/users");
}
