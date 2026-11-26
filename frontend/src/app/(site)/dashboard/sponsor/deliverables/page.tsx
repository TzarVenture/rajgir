import Link from "next/link";
import { requirePartnerDashboard } from "@/lib/groupPartnerData";
import { DashboardHeading, DetailList, SectionCard } from "@/components/dashboard/DashboardParts";
import { Badge, buttonClasses } from "@/components/ui";

export const metadata = {
  title: "Brand Deliverables & Passes | Rajgir Marathon 2027",
};

export default async function SponsorDeliverablesPage() {
  const data = await requirePartnerDashboard("SPONSOR");
  const p = data.profile;

  return (
    <div className="space-y-6">
      <DashboardHeading
        eyebrow={<Badge tone="brand">Brand Visibility &amp; VIP Hospitality</Badge>}
        title="Deliverables &amp; VIP Tent Passes"
        subtitle="Track your contracted brand placements and VIP hospitality entitlements."
        actions={
          <Link href="/dashboard/sponsor/profile" className={buttonClasses({ variant: "secondary", size: "md" })}>
            Update Deliverables Notes
          </Link>
        }
      />

      <SectionCard title="Partnership Entitlements">
        <DetailList
          rows={[
            { label: "Partner Brand", value: String(p.brandName ?? "—") },
            { label: "Tier", value: String(p.tierInterest ?? "—") },
            { label: "Agreed Deliverables", value: String(p.proposalDeliverables || "Stage backdrop, Bib logo, VIP Enclosure passes") },
            { label: "Approval Status", value: String(p.status ?? "pending").toUpperCase() },
          ]}
        />
      </SectionCard>
    </div>
  );
}
