import { prisma } from "@/src/lib/prisma";

export type TenantPlan = "FREE" | "PRO";

export function isProStatus(status?: string | null) {
  // Stripe statuses you want to treat as “Pro unlocked”
  // active = paying, trialing = within trial
  return status === "active" || status === "trialing";
}

export async function getTenantPlan(tenantId: string): Promise<{
  plan: TenantPlan;
  status: string;
  currentPeriodEnd: Date | null;
}> {
  const sub = await prisma.tenantSubscription.findUnique({
    where: { tenantId },
    select: { status: true, currentPeriodEnd: true },
  });

  const status = sub?.status ?? "inactive";
  const active = isProStatus(status);

  return {
    plan: active ? "PRO" : "FREE",
    status,
    currentPeriodEnd: sub?.currentPeriodEnd ?? null,
  };
}
