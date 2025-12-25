// ovibase/src/lib/permissions.ts
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { requireTenant } from "@/src/lib/guards";
import { isAdminRole } from "@/src/lib/admin";

export type PermissionKey =
  | "members"
  | "leaders"
  | "attendance"
  | "finance"
  | "sms";

export async function requireAdmin() {
  const ctx = await requireTenant();
  if (!isAdminRole(ctx.role)) redirect("/app/unauthorized");
  return ctx;
}

export async function requirePermission(key: PermissionKey) {
  const ctx = await requireTenant();

  // Admins can do everything
  if (isAdminRole(ctx.role)) return ctx;

  const ut = await prisma.userTenant.findUnique({
    where: {
      userId_tenantId: {
        userId: ctx.session.userId,
        tenantId: ctx.tenant.id,
      },
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

  const allowed =
    (key === "members" && ut.canMembers) ||
    (key === "leaders" && ut.canLeaders) ||
    (key === "attendance" && ut.canAttendance) ||
    (key === "finance" && ut.canFinance) ||
    (key === "sms" && ut.canSms);

  if (!allowed) redirect("/app/unauthorized");

  return ctx;
}
