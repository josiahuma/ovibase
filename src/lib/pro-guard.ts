import { redirect } from "next/navigation";
import { getTenantPlan } from "@/src/lib/billing";

export async function requirePro(tenantId: string) {
  const { plan } = await getTenantPlan(tenantId);
  if (plan !== "PRO") redirect("/app/upgrade?reason=pro");
}
