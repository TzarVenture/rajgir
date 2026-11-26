import React from "react";
import { roleLabel as getRoleLabel, registerPathForRole } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/DashboardShell";
import { DashboardSupportDrawer } from "@/components/dashboard/support/DashboardSupportDrawer";
import { BOTTOM_TABS, JOURNEYS, ROLE_KEY, audienceForRole, journeyProgress, roleNavItems } from "@/lib/navigation";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser("/dashboard");
  const roleLabel = getRoleLabel(user.role);

  const isRunner = user.role === "RUNNER";
  const isVolunteer = user.role === "VOLUNTEER";
  const isInfluencer = user.role === "INFLUENCER";

  // Sidebar, bottom tabs and journey all come from the navigation registry (lib/navigation).
  // Staff and role-less accounts get a small generic menu.
  const roleKey = user.role ? ROLE_KEY[user.role] : undefined;
  const items: DashboardNavItem[] = roleKey
    ? roleNavItems(roleKey, user.role)
    : [
      { href: "/dashboard", label: "Overview", icon: "overview" },
      { href: registerPathForRole(user.role), label: "My registration", icon: "registration" },
      { href: "/contact", label: "Contact and help", icon: "help" },
      { href: "/", label: "Home", icon: "home" },
    ];

  const audience = audienceForRole(user.role);
  const journey = audience ? JOURNEYS[audience] : null;
  const progress = journey ? journeyProgress(journey, user) : null;

  return (
    <DashboardShell
      items={items}
      userName={user.name}
      role={user.role}
      status={user.status}
      title={`${roleLabel} dashboard`}
      bottomTabs={roleKey ? BOTTOM_TABS[roleKey] : undefined}
      journey={journey}
      progress={progress}
      audience={audience}
    >
      {children}
      <DashboardSupportDrawer
        context={{
          athleteName: user.name,
          email: user.email,
          phone: user.phone ?? undefined,
          roleLabel: isVolunteer
            ? "Volunteer Crew"
            : isInfluencer
              ? "Media Creator"
              : isRunner
                ? "Registered Runner"
                : undefined,
        }}
        helpdeskHref={
          isVolunteer
            ? "/dashboard/volunteer/support"
            : isInfluencer
              ? "/dashboard/influencer/support"
              : "/dashboard/runner/support"
        }
      />
    </DashboardShell>
  );
}
