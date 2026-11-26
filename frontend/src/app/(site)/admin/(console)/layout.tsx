import type { ReactNode } from "react";
import { LuLogOut } from "react-icons/lu";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { roleLabel } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { ADMIN_NAV } from "@/lib/navigation";

/** Routed admin console shell (light theme). The staff-only gate is in the parent admin/layout.tsx. */
export default async function AdminConsoleLayout({ children }: Readonly<{ children: ReactNode }>) {
  const user = await requireUser("/admin");
  return (
    <DashboardShell
      items={ADMIN_NAV}
      userName={user.name}
      roleLabel={roleLabel(user.role)}
      logoutForm={
        <form action={logout}>
          <Button type="submit" variant="secondary" size="md" icon={LuLogOut}>
            Log out
          </Button>
        </form>
      }
    >
      {children}
    </DashboardShell>
  );
}
