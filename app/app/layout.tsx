import { requireTenantWithUserTenant, isAdminRole } from "@/src/lib/guards";
import AppShell from "@/src/components/AppShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OviBase – Church Administration Made Simple",
  description:
    "Manage members, attendance, finance and bulk SMS in one secure workspace with role-based access.",
  metadataBase: new URL("https://ovibase.com"),

  openGraph: {
    title: "OviBase – Church Administration Made Simple",
    description:
      "Manage members, attendance, finance and bulk SMS in one secure workspace.",
    url: "https://ovibase.com",
    siteName: "OviBase",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OviBase",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "OviBase – Church Administration Made Simple",
    description:
      "Manage members, attendance, finance and bulk SMS in one secure workspace.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant, ut } = await requireTenantWithUserTenant();

  return (
    <AppShell
      tenant={tenant}
      ut={ut}
      isAdmin={isAdminRole(ut.role)}
    >
      {children}
    </AppShell>
  );
}
