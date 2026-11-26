import Link from "next/link";
import { requirePartnerDashboard } from "@/lib/groupPartnerData";
import { EVENT, formatDate } from "@/lib/event";
import { DashboardHeading, DetailList, SectionCard } from "@/components/dashboard/DashboardParts";
import { Badge, buttonClasses } from "@/components/ui";

export const metadata = {
  title: "Stall & Compliance | Rajgir Marathon 2027",
};

const expoFirstDay = EVENT.expo.days[0].date;
const moveInDay = new Date(new Date(`${expoFirstDay}T00:00:00+05:30`).getTime() - 86_400_000);

export default async function VendorStallPage() {
  const data = await requirePartnerDashboard("VENDOR");
  const p = data.profile;

  return (
    <div className="space-y-6">
      <DashboardHeading
        eyebrow={<Badge tone="brand">Expo Operations &amp; Utilities</Badge>}
        title="Stall Allocation &amp; Compliance"
        subtitle="Check your move-in schedule, power requirements, and food safety compliance."
        actions={
          <Link href="/dashboard/vendor/profile" className={buttonClasses({ variant: "secondary", size: "md" })}>
            Update FSSAI / Power Needs
          </Link>
        }
      />

      <SectionCard title="Stall &amp; Move-In Specifications">
        <DetailList
          rows={[
            { label: "Business Name", value: String(p.businessName ?? "—") },
            { label: "Stall Size", value: String(p.stallSize ?? "—") },
            { label: "Move-In Date", value: `${formatDate(moveInDay)} (10:00 AM – 06:00 PM)` },
            { label: "Expo Venue", value: EVENT.expo.venue },
            { label: "Power Required", value: p.electricPowerRequired ? "Yes — 220V Supply" : "No" },
            { label: "FSSAI Number", value: String(p.fssaiNumber || "Not provided") },
          ]}
        />
      </SectionCard>
    </div>
  );
}
