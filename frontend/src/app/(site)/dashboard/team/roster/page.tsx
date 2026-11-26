import { requireGroupDashboard } from "@/lib/groupPartnerData";
import { DashboardHeading } from "@/components/dashboard/DashboardParts";
import { GroupRosterManager } from "@/components/dashboard/group/GroupRosterManager";
import { Badge } from "@/components/ui";

export const metadata = {
  title: "Squad Roster & Add Runners | Rajgir Marathon 2027",
};

export default async function TeamRosterPage() {
  const data = await requireGroupDashboard("TEAM_CAPTAIN");

  return (
    <div className="space-y-6">
      <DashboardHeading
        eyebrow={<Badge tone="brand">Running Club Squad</Badge>}
        title="Squad Roster &amp; Bulk Runner Onboarding"
        subtitle="Add club members manually or upload a CSV / Excel file. Up to 50 runners by default."
      />
      <GroupRosterManager initial={data} memberLabel="Club Runner" defaultRelation="Teammate / Family" />
    </div>
  );
}
