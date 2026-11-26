import { requirePartnerDashboard } from "@/lib/groupPartnerData";
import { DashboardHeading } from "@/components/dashboard/DashboardParts";
import { PartnerProfileHub } from "@/components/dashboard/partner/PartnerProfileHub";
import { Badge } from "@/components/ui";

export const metadata = {
  title: "Vendor Profile & Settings | Rajgir Marathon 2027",
};

export default async function VendorProfilePage() {
  const data = await requirePartnerDashboard("VENDOR");

  return (
    <div className="space-y-6">
      <DashboardHeading
        eyebrow={<Badge tone="brand">Settings &amp; Identity</Badge>}
        title="Business Profile &amp; Account Settings"
        subtitle="Update your business name, FSSAI license, utility requirements, contact phone, and password."
      />
      <PartnerProfileHub initial={data} />
    </div>
  );
}
