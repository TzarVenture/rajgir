import { requireGroupDashboard } from "@/lib/groupPartnerData";
import { DashboardHeading } from "@/components/dashboard/DashboardParts";
import { GroupRosterManager } from "@/components/dashboard/group/GroupRosterManager";
import { Badge } from "@/components/ui";

export const metadata = {
  title: "Employee Roster & Bulk Upload | Rajgir Marathon 2027",
};

export default async function CorporateRosterPage() {
  const data = await requireGroupDashboard("CORPORATE_MANAGER");

  return (
    <div className="space-y-6">
      <DashboardHeading
        eyebrow={<Badge tone="brand">Corporate Delegation</Badge>}
        title="Employee Runner Roster &amp; Bulk Upload"
        subtitle="Register employees manually or import a CSV / Excel sheet. Employees skip account login."
      />
      <GroupRosterManager initial={data} memberLabel="Employee" defaultRelation="Colleague / Family" />
    </div>
  );
}
