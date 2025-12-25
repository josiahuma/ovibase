import { requireTenantWithUserTenant, isAdminRole } from "@/src/lib/guards";
import AppShell from "@/src/components/AppShell";

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
