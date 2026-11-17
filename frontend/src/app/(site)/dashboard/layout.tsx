import React from "react";
import { LuLogOut } from "react-icons/lu";
import { logout } from "@/app/actions/auth";
import { roleLabel as getRoleLabel, registerPathForRole } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { Button } from "@/components/ui";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser("/dashboard");
  const roleLabel = getRoleLabel(user.role);

  const items: DashboardNavItem[] = [
    { href: "/dashboard", label: "Overview", icon: "overview" },
    { href: registerPathForRole(user.role), label: "My registration", icon: "registration" },
    { href: "/contact", label: "Contact and help", icon: "help" },
    { href: "/", label: "Home", icon: "home" },
  ];

  return (
    <DashboardShell
      items={items}
      userName={user.name}
      roleLabel={roleLabel}
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
