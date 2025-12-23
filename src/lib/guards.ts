import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import type { UserRole } from "@prisma/client";

export type GuardResult = {
  session: {
    userId: string;
    tenantId: string;
    role: UserRole;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  role: UserRole;
};

export async function requireSession(): Promise<GuardResult["session"]> {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!session.userId || !session.tenantId || !session.role) redirect("/login");

  return {
    userId: session.userId,
    tenantId: session.tenantId,
    role: session.role,
  };
}

export async function requireTenant(): Promise<GuardResult> {
  const session = await requireSession();

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    select: { id: true, name: true, slug: true },
  });

  if (!tenant) redirect("/login");

  // role is already in the session cookie (your login sets it)
  const role = session.role;

  return { session, tenant, role };
}

export async function requireAdmin(): Promise<GuardResult> {
  const ctx = await requireTenant();
  const isAdmin = ctx.role === "OWNER" || ctx.role === "ADMIN";
  if (!isAdmin) redirect("/app");
  return ctx;
}
