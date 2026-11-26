import Link from "next/link";
import { requirePartnerDashboard } from "@/lib/groupPartnerData";
import { DashboardHeading, DetailList, SectionCard } from "@/components/dashboard/DashboardParts";
import { Badge, buttonClasses } from "@/components/ui";

export const metadata = {
  title: "Listing & Runner Offers | Rajgir Marathon 2027",
};

export default async function TourismOffersPage() {
  const data = await requirePartnerDashboard("TOURISM_PARTNER");
  const p = data.profile;

  return (
    <div className="space-y-6">
      <DashboardHeading
        eyebrow={<Badge tone="brand">Visitor Stays &amp; Transport</Badge>}
        title="Listing &amp; Runner Discount Offers"
        subtitle="Details shown to outstation marathon runners visiting Rajgir."
        actions={
          <Link href="/dashboard/tourism/profile" className={buttonClasses({ variant: "secondary", size: "md" })}>
            Edit Offer &amp; Capacity
          </Link>
        }
      />

      <SectionCard title="Active Hospitality Listing">
        <DetailList
          rows={[
            { label: "Property / Service", value: String(p.businessName ?? "—") },
            { label: "Category", value: String(p.serviceType ?? "—") },
            { label: "Location", value: String(p.location ?? "—") },
            { label: "Inventory Capacity", value: String(p.inventoryCapacity ?? "—") },
            { label: "Special Runner Discount", value: String(p.discountOffering || "None set") },
            { label: "Listing Status", value: String(p.status ?? "pending").toUpperCase() },
          ]}
        />
      </SectionCard>
    </div>
  );
}
