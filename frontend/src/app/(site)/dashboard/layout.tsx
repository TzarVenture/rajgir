import React from "react";
import { LuLogOut } from "react-icons/lu";
import { logout } from "@/app/actions/auth";
import { roleLabel as getRoleLabel, registerPathForRole } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { Button } from "@/components/ui";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/DashboardShell";
import { DashboardSupportDrawer } from "@/components/dashboard/support/DashboardSupportDrawer";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser("/dashboard");
  const roleLabel = getRoleLabel(user.role);

  const isRunner = user.role === "RUNNER";
  const isVolunteer = user.role === "VOLUNTEER";
  const isInfluencer = user.role === "INFLUENCER";
  const isTeam = user.role === "TEAM_CAPTAIN";
  const isCorporate = user.role === "CORPORATE_MANAGER";
  const isSchool = user.role === "SCHOOL_COORDINATOR";
  const isSponsor = user.role === "SPONSOR";
  const isVendor = user.role === "VENDOR";
  const isTourism = user.role === "TOURISM_PARTNER";

  const items: DashboardNavItem[] = isRunner
    ? [
      { href: "/dashboard/runner", label: "Overview Hub", icon: "overview" },
      { href: "/dashboard/runner/bib", label: "Digital Bib Pass", icon: "bib" },
      { href: "/dashboard/runner/splits", label: "Race & Splits", icon: "splits" },
      { href: "/dashboard/runner/medical", label: "Medical Profile", icon: "medical" },
      { href: "/dashboard/runner/training", label: "Training Plan", icon: "training" },
      { href: "/dashboard/runner/invoice", label: "Invoice & Certificate", icon: "invoice" },
      { href: "/dashboard/runner/profile", label: "Profile & Account", icon: "profile" },
      { href: "/dashboard/runner/support", label: "Support & Helpdesk", icon: "help" },
      { href: "/", label: "Marathon Home", icon: "home" },
    ]
    : isVolunteer
      ? [
        { href: "/dashboard/volunteer", label: "Overview Hub", icon: "overview" },
        { href: "/dashboard/volunteer/shift", label: "Duty & Shift Control", icon: "shift" },
        { href: "/dashboard/volunteer/badge", label: "Accreditation Badge", icon: "badge" },
        { href: "/dashboard/volunteer/checklist", label: "Station Checklist", icon: "checklist" },
        { href: "/dashboard/volunteer/incidents", label: "Incident Desk", icon: "incidents" },
        { href: "/dashboard/volunteer/sop", label: "Field SOP Manual", icon: "sop" },
        { href: "/dashboard/volunteer/application", label: "My Application", icon: "registration" },
        { href: "/dashboard/volunteer/profile", label: "Profile & Account", icon: "profile" },
        { href: "/dashboard/volunteer/support", label: "Support & Helpdesk", icon: "help" },
        { href: "/", label: "Marathon Home", icon: "home" },
      ]
      : isInfluencer
        ? [
          { href: "/dashboard/influencer", label: "Overview Hub", icon: "overview" },
          { href: "/dashboard/influencer/pass", label: "Media Accreditation Pass", icon: "pass" },
          { href: "/dashboard/influencer/deliverables", label: "Campaign Deliverables", icon: "deliverables" },
          { href: "/dashboard/influencer/brand-kit", label: "Brand Kit & Promo Code", icon: "brand" },
          { href: "/dashboard/influencer/application", label: "My Application", icon: "registration" },
          { href: "/dashboard/influencer/profile", label: "Profile & Account", icon: "profile" },
          { href: "/dashboard/influencer/support", label: "PR & Media Helpdesk", icon: "help" },
          { href: "/", label: "Marathon Home", icon: "home" },
        ]
        : isTeam
          ? [
            { href: "/dashboard/team", label: "Overview Hub", icon: "overview" },
            { href: "/dashboard/team/roster", label: "Squad Roster & Add Runners", icon: "users" },
            { href: "/dashboard/team/profile", label: "Club Profile & Settings", icon: "profile" },
            { href: "/contact", label: "Organizer Helpdesk", icon: "help" },
            { href: "/", label: "Marathon Home", icon: "home" },
          ]
          : isCorporate
            ? [
              { href: "/dashboard/corporate", label: "Overview Hub", icon: "overview" },
              { href: "/dashboard/corporate/roster", label: "Employee Roster & Upload", icon: "users" },
              { href: "/dashboard/corporate/billing", label: "GST & Billing", icon: "invoice" },
              { href: "/dashboard/corporate/profile", label: "Company Profile & Settings", icon: "building" },
              { href: "/contact", label: "Corporate Helpdesk", icon: "help" },
              { href: "/", label: "Marathon Home", icon: "home" },
            ]
            : isSchool
              ? [
                { href: "/dashboard/school", label: "Overview Hub", icon: "overview" },
                { href: "/dashboard/school/roster", label: "Student Roster & Upload", icon: "users" },
                { href: "/dashboard/school/compliance", label: "Consent & Compliance", icon: "checklist" },
                { href: "/dashboard/school/profile", label: "School Profile & Settings", icon: "school" },
                { href: "/contact", label: "School Helpdesk", icon: "help" },
                { href: "/", label: "Marathon Home", icon: "home" },
              ]
              : isSponsor
                ? [
                  { href: "/dashboard/sponsor", label: "Overview Hub", icon: "overview" },
                  { href: "/dashboard/sponsor/deliverables", label: "Brand Deliverables & Passes", icon: "brand" },
                  { href: "/dashboard/sponsor/profile", label: "Brand Profile & Settings", icon: "profile" },
                  { href: "/contact", label: "Sponsorship Desk", icon: "help" },
                  { href: "/", label: "Marathon Home", icon: "home" },
                ]
                : isVendor
                  ? [
                    { href: "/dashboard/vendor", label: "Overview Hub", icon: "overview" },
                    { href: "/dashboard/vendor/stall", label: "Stall & Compliance", icon: "stall" },
                    { href: "/dashboard/vendor/profile", label: "Business Profile & Settings", icon: "profile" },
                    { href: "/contact", label: "Expo Desk", icon: "help" },
                    { href: "/", label: "Marathon Home", icon: "home" },
                  ]
                  : isTourism
                    ? [
                      { href: "/dashboard/tourism", label: "Overview Hub", icon: "overview" },
                      { href: "/dashboard/tourism/offers", label: "Listing & Runner Offers", icon: "hotel" },
                      { href: "/dashboard/tourism/profile", label: "Partner Profile & Settings", icon: "profile" },
                      { href: "/contact", label: "Hospitality Desk", icon: "help" },
                      { href: "/", label: "Marathon Home", icon: "home" },
                    ]
                    : [
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
