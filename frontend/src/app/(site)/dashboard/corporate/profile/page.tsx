import { requireGroupDashboard } from "@/lib/groupPartnerData";
import { DashboardHeading } from "@/components/dashboard/DashboardParts";
import { GroupProfileHub } from "@/components/dashboard/group/GroupProfileHub";
import { Badge } from "@/components/ui";

export const metadata = {
  title: "Company Profile & Settings | Rajgir Marathon 2027",
};

export default async function CorporateProfilePage() {
  const data = await requireGroupDashboard("CORPORATE_MANAGER");

  return (
    <div className="space-y-6">
      <DashboardHeading
        eyebrow={<Badge tone="brand">Settings &amp; Identity</Badge>}
        title="Company Profile &amp; Account Settings"
        subtitle="Manage your corporate details, GSTIN, manager contact, and account security."
      />
      <GroupProfileHub initial={data} />
    </div>
  );
}
