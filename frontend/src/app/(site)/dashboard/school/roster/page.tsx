import { requireGroupDashboard } from "@/lib/groupPartnerData";
import { DashboardHeading } from "@/components/dashboard/DashboardParts";
import { GroupRosterManager } from "@/components/dashboard/group/GroupRosterManager";
import { Badge } from "@/components/ui";

export const metadata = {
  title: "Student Roster & Bulk Upload | Rajgir Marathon 2027",
};

export default async function SchoolRosterPage() {
  const data = await requireGroupDashboard("SCHOOL_COORDINATOR");

  return (
    <div className="space-y-6">
      <DashboardHeading
        eyebrow={<Badge tone="brand">School Contingent</Badge>}
        title="Student Runner Roster &amp; Bulk Upload"
        subtitle="Add students manually or upload an Excel / CSV sheet. Students do not need individual logins or emails."
      />
      <GroupRosterManager initial={data} memberLabel="Student" defaultRelation="Parent / Guardian" />
    </div>
  );
}
