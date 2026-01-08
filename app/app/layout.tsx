import { requireTenantWithUserTenant, isAdminRole } from "@/src/lib/guards";
import AppShell from "@/src/components/AppShell";
import type { Metadata } from "next";
import { getTenantPlan } from "@/src/lib/billing";

export const metadata: Metadata = {
  title: "OviBase – Church Administration Made Simple",
  description:
    "Manage members, attendance, finance and bulk SMS in one secure workspace with role-based access.",
  metadataBase: new URL("https://ovibase.com"),
  openGraph: {
    title: "OviBase – Church Administration Made Simple",
    description: "Manage members, attendance, finance and bulk SMS in one secure workspace.",
    url: "https://ovibase.com",
    siteName: "OviBase",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "OviBase" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OviBase – Church Administration Made Simple",
    description: "Manage members, attendance, finance and bulk SMS in one secure workspace.",
    images: ["/og-image.png"],
  },
  icons: { icon: "/favicon.ico", apple: "/favicon.ico" },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant, ut } = await requireTenantWithUserTenant();
  const isAdmin = isAdminRole(ut.role);

  const plan = await getTenantPlan(tenant.id);

  const donationUrl = `https://${tenant.slug}.${process.env.APP_BASE_DOMAIN}/donate`;

  // stripeEnabled here should be: “tenant donation stripe configured?”
  // If you already have a helper that checks tenant stripe settings, use it.
  // For now, keep it true/false based on your existing logic.
  const stripeEnabled = true;

  return (
    <AppShell
      tenant={tenant}
      ut={ut}
      isAdmin={isAdmin}
      donationUrl={donationUrl}
      stripeEnabled={stripeEnabled}
      tenantPlan={plan.plan}
    >
      {children}
    </AppShell>
  );
}
