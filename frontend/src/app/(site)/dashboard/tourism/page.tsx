import Link from "next/link";
import { LuHotel, LuMapPin, LuPercent } from "react-icons/lu";
import { requirePartnerDashboard } from "@/lib/groupPartnerData";
import { DashboardHeading, DetailList, SectionCard } from "@/components/dashboard/DashboardParts";
import { Badge, StatCard, buttonClasses } from "@/components/ui";

export const metadata = {
  title: "Hotel & Tourism Partner Dashboard | Rajgir Marathon 2027",
};

export default async function TourismOverviewPage() {
  const data = await requirePartnerDashboard("TOURISM_PARTNER");
  const p = data.profile;

  return (
    <div className="space-y-6 lg:space-y-8">
      <DashboardHeading
        eyebrow={
          <>
            <Badge tone="brand">Tourism &amp; Hospitality Partner</Badge>
            <Badge tone="success">{String(p.status ?? "Active")}</Badge>
          </>
        }
        title={String(p.businessName ?? "Hospitality Partner")}
        subtitle={`Manager: ${data.identity.fullName} • ${data.identity.email}`}
        actions={
          <Link href="/dashboard/tourism/offers" className={buttonClasses({ variant: "primary", size: "md" })}>
            <LuPercent className="h-4 w-4" aria-hidden />
            Manage Listing &amp; Runner Offers
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Service Type" value={String(p.serviceType ?? "—")} hint="Hospitality category" icon={LuHotel} />
        <StatCard label="Location" value={String(p.location ?? "Rajgir")} hint={String(p.distanceFromStartLine || "Near start line")} icon={LuMapPin} />
        <StatCard label="Runner Offer" value={String(p.discountOffering || "Standard Rate")} hint={`Capacity: ${String(p.inventoryCapacity ?? "—")}`} icon={LuPercent} />
      </div>

      <SectionCard
        title="Partner Listing Summary"
        tag={
          <Link href="/dashboard/tourism/profile" className={buttonClasses({ variant: "secondary", size: "sm" })}>
            Edit Listing Profile
          </Link>
        }
      >
        <DetailList
          rows={[
            { label: "Business / Property Name", value: String(p.businessName ?? "—") },
            { label: "Location", value: String(p.location ?? "—") },
            { label: "Distance from Start Line", value: String(p.distanceFromStartLine || "—") },
            { label: "Inventory / Capacity", value: String(p.inventoryCapacity ?? "—") },
            { label: "Runner Discount Offer", value: String(p.discountOffering || "—") },
          ]}
        />
      </SectionCard>
    </div>
  );
}
