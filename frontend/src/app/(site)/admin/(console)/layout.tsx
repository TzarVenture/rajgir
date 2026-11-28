import type { ReactNode } from "react";
import { LuLogOut } from "react-icons/lu";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { roleLabel } from "@/lib/auth/roles";
import { getCurrentUser } from "@/lib/auth/session";
import { ADMIN_NAV } from "@/lib/navigation";

/**
 * Admin console shell (sidebar, top bar). The staff-only gate is in the parent admin/layout.tsx;
 * signed-out visitors get no shell, and the page itself redirects them to /login with its own URL.
 */
export default async function AdminConsoleLayout({ children }: Readonly<{ children: ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) return children;
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
