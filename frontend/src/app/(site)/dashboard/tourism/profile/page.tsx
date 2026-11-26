import { requirePartnerDashboard } from "@/lib/groupPartnerData";
import { DashboardHeading } from "@/components/dashboard/DashboardParts";
import { PartnerProfileHub } from "@/components/dashboard/partner/PartnerProfileHub";
import { Badge } from "@/components/ui";

export const metadata = {
  title: "Partner Profile & Settings | Rajgir Marathon 2027",
};

export default async function TourismProfilePage() {
  const data = await requirePartnerDashboard("TOURISM_PARTNER");

  return (
    <div className="space-y-6">
      <DashboardHeading
        eyebrow={<Badge tone="brand">Settings &amp; Identity</Badge>}
        title="Partner Profile &amp; Account Settings"
        subtitle="Update your property details, distance from start line, runner discount, contact phone, and password."
      />
      <PartnerProfileHub initial={data} />
    </div>
  );
}
