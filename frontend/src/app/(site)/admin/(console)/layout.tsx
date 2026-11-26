import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireUser } from "@/lib/auth/session";
import { ADMIN_BOTTOM_TABS, ADMIN_NAV } from "@/lib/navigation";

/** Routed admin console shell (light theme). The staff-only gate is in the parent admin/layout.tsx. */
export default async function AdminConsoleLayout({ children }: Readonly<{ children: ReactNode }>) {
  const user = await requireUser("/admin");
  return (
    <DashboardShell
      items={ADMIN_NAV}
      userName={user.name}
      role={user.role}
      status={user.status}
      title="Admin console"
      footerText="Rajgir Marathon 2027 | Admin console | Staff access only"
      bottomTabs={ADMIN_BOTTOM_TABS}
    >
      {children}
    </DashboardShell>
  );
}
