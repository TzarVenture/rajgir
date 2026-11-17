import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { LuBuilding2, LuHeadset, LuReceipt, LuShirt, LuUsers } from "react-icons/lu";
import { Badge, Button, EmptyState, StatCard } from "@/components/ui";
import { DashboardHeading, SectionCard } from "@/components/dashboard/DashboardParts";

export const metadata = {
  title: "Group Delegation Dashboard | Rajgir Marathon 2027",
};

export default async function GroupDashboard() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (!user.role || !["TEAM_CAPTAIN", "CORPORATE_MANAGER", "SCHOOL_COORDINATOR"].includes(user.role)) {
    redirect("/dashboard");
  }

  const roleTitles: Record<string, string> = {
    TEAM_CAPTAIN: "Running Squad & Team Captain",
    CORPORATE_MANAGER: "Corporate Wellness Delegation",
    SCHOOL_COORDINATOR: "School & College Contingent",
  };

  const isTeam = user.role === "TEAM_CAPTAIN";
  const isCorporate = user.role === "CORPORATE_MANAGER";
  const isSchool = user.role === "SCHOOL_COORDINATOR";

  return (
    <div className="space-y-6 lg:space-y-8">
      <DashboardHeading
        eyebrow={
          <>
            <Badge tone="brand">Group delegation: {roleTitles[user.role]}</Badge>
            <Badge tone="success">Active management</Badge>
          </>
        }
        title={`Welcome, Captain / Manager ${user.name}`}
        subtitle={`Authorized account: ${user.email} | Mobile: ${user.phone || "-"}`}
        actions={
          <>
            {isCorporate && <Badge tone="info">B2B invoicing ready</Badge>}
            {isSchool && <Badge tone="info">Institutional pass tier</Badge>}
          </>
        }
      />

      <section aria-label="Delegation overview" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Delegation type"
          value={isTeam ? "Athletic club" : isCorporate ? "Corporate CSR" : "School / college"}
          icon={LuBuilding2}
          hint="Bulk pass enrollment"
        />
        <StatCard label="Kit collection mode" value="Consolidated pickup" icon={LuShirt} hint="Expo Group Desk A4" />
        <StatCard label="Group invoicing" value="GST compliant" icon={LuReceipt} hint="B2B tax invoices available" />
        <StatCard label="Liaison officer" value="Assigned" icon={LuHeadset} hint="Direct WhatsApp & desk" />
      </section>

      <SectionCard
        title="Delegation roster and member passes"
        description="Manage your participants, allocate race distances, and track bib assignments."
        tag={
          <Button variant="secondary" size="md">
            Download roster CSV
          </Button>
        }
      >
        <EmptyState
          icon={LuUsers}
          title="Group roster syncing active"
          description="Your group delegation is registered with the organizing committee. As your members register using your delegation credentials, their bib allotments will appear here in real time."
        />
      </SectionCard>
    </div>
  );
}
