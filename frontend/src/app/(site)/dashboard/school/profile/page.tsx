import { requireGroupDashboard } from "@/lib/groupPartnerData";
import { DashboardHeading } from "@/components/dashboard/DashboardParts";
import { GroupProfileHub } from "@/components/dashboard/group/GroupProfileHub";
import { Badge } from "@/components/ui";

export const metadata = {
  title: "School Profile & Settings | Rajgir Marathon 2027",
};

export default async function SchoolProfilePage() {
  const data = await requireGroupDashboard("SCHOOL_COORDINATOR");

  return (
    <div className="space-y-6">
      <DashboardHeading
        eyebrow={<Badge tone="brand">Settings &amp; Identity</Badge>}
        title="School Profile &amp; Account Settings"
        subtitle="Update your school details, teacher in-charge, contact phone, and password."
      />
      <GroupProfileHub initial={data} />
    </div>
  );
}
