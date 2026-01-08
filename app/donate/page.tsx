import { redirect } from "next/navigation";
import { getTenantFromRequest } from "@/src/lib/tenant";
import { prisma } from "@/src/lib/prisma";
import DonateClient from "./DonateClient";

export default async function DonatePage() {
  const tenant = await getTenantFromRequest();

  // Root domain should NOT accept donations
  if (!tenant) {
    redirect("/");
  }

  const funds = await prisma.donationFund.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    select: { id: true, name: true, isDefault: true },
  });

  return <DonateClient tenantName={tenant.name} funds={funds} />;
}
