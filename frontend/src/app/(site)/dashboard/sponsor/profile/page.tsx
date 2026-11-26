import { requirePartnerDashboard } from "@/lib/groupPartnerData";
import { DashboardHeading } from "@/components/dashboard/DashboardParts";
import { PartnerProfileHub } from "@/components/dashboard/partner/PartnerProfileHub";
import { Badge } from "@/components/ui";

export const metadata = {
  title: "Brand Profile & Settings | Rajgir Marathon 2027",
};

export default async function SponsorProfilePage() {
  const data = await requirePartnerDashboard("SPONSOR");

  return (
    <div className="space-y-6">
      <DashboardHeading
        eyebrow={<Badge tone="brand">Settings &amp; Identity</Badge>}
        title="Brand Profile &amp; Account Settings"
        subtitle="Update your brand details, website, deliverables, contact phone, and password."
      />
      <PartnerProfileHub initial={data} />
    </div>
  );
}
