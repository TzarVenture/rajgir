import { requireGroupDashboard } from "@/lib/groupPartnerData";
import { DashboardHeading } from "@/components/dashboard/DashboardParts";
import { GroupProfileHub } from "@/components/dashboard/group/GroupProfileHub";
import { Badge } from "@/components/ui";

export const metadata = {
  title: "Club Profile & Settings | Rajgir Marathon 2027",
};

export default async function TeamProfilePage() {
  const data = await requireGroupDashboard("TEAM_CAPTAIN");

  return (
    <div className="space-y-6">
      <DashboardHeading
        eyebrow={<Badge tone="brand">Settings &amp; Identity</Badge>}
        title="Club Profile &amp; Account Settings"
        subtitle="Update your running club information, captain contact details, and password."
      />
      <GroupProfileHub initial={data} />
    </div>
  );
}
