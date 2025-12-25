// src/lib/guards.ts
import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import type { UserRole } from "@prisma/client";

export type GuardSession = {
  userId: string;
  tenantId: string;
  role: UserRole;
};

export type GuardTenant = {
  id: string;
  name: string;
  slug: string;
};

export type GuardResult = {
  session: GuardSession;
  tenant: GuardTenant;
  role: UserRole;
};

export type GuardResultWithUserTenant = GuardResult & {
  ut: {
    role: UserRole;
    canMembers: boolean;
    canLeaders: boolean;
    canAttendance: boolean;
    canFinance: boolean;
    canSms: boolean;
  };
};

export function isAdminRole(role: UserRole) {
  return role === "OWNER" || role === "ADMIN";
}

export async function requireSession(): Promise<GuardSession> {
  const session = await getSession();
  if (!session) redirect("/login");

  // payload is coming from JWT; validate shape
  if (!session.userId || !session.tenantId || !session.role) redirect("/login");

  return {
    userId: session.userId,
    tenantId: session.tenantId,
    role: session.role as UserRole,
  };
}

export async function requireTenant(): Promise<GuardResult> {
  const session = await requireSession();

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    select: { id: true, name: true, slug: true },
  });

  if (!tenant) redirect("/login");

  const role = session.role;

  return { session, tenant, role };
}

export async function requireTenantWithUserTenant(): Promise<GuardResultWithUserTenant> {
  const ctx = await requireTenant();

  const ut = await prisma.userTenant.findUnique({
    where: {
      userId_tenantId: { userId: ctx.session.userId, tenantId: ctx.tenant.id },
    },
    select: {
      role: true,
      canMembers: true,
      canLeaders: true,
      canAttendance: true,
      canFinance: true,
      canSms: true,
    },
  });

  if (!ut) redirect("/login");

  return { ...ctx, ut };
}

export async function requireAdmin(): Promise<GuardResultWithUserTenant> {
  const ctx = await requireTenantWithUserTenant();
  if (!isAdminRole(ctx.ut.role)) redirect("/app");
  return ctx;
}
