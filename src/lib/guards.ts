// src/lib/guards.ts
import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { isDbDownError } from "@/src/lib/db-safe";
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

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { id: true, name: true, slug: true },
    });

    if (!tenant) redirect("/login");

    return { session, tenant, role: session.role };
  } catch (err) {
    // ✅ DB temporarily unavailable: show friendly page instead of digest screen
    if (isDbDownError(err)) {
      redirect("/db-down");
    }

    // unknown error: still don't white-screen
    console.error("requireTenant error:", err);
    redirect("/login");
  }
}

export async function requireTenantWithUserTenant(): Promise<GuardResultWithUserTenant> {
  const ctx = await requireTenant();

  try {
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
  } catch (err) {
    if (isDbDownError(err)) redirect("/db-down");
    console.error("requireTenantWithUserTenant error:", err);
    redirect("/login");
  }
}

export async function requireAdmin(): Promise<GuardResultWithUserTenant> {
  const ctx = await requireTenantWithUserTenant();
  if (!isAdminRole(ctx.ut.role)) redirect("/app");
  return ctx;
}
