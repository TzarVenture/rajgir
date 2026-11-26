import Link from "next/link";
import { LuShieldCheck, LuStore, LuZap } from "react-icons/lu";
import { requirePartnerDashboard } from "@/lib/groupPartnerData";
import { EVENT, formatDate } from "@/lib/event";
import { DashboardHeading, DetailList, SectionCard } from "@/components/dashboard/DashboardParts";
import { Badge, StatCard, buttonClasses } from "@/components/ui";

export const metadata = {
  title: "Expo & Food Vendor Dashboard | Rajgir Marathon 2027",
};

const expoFirstDay = EVENT.expo.days[0].date;
const moveInDay = new Date(new Date(`${expoFirstDay}T00:00:00+05:30`).getTime() - 86_400_000);

export default async function VendorOverviewPage() {
  const data = await requirePartnerDashboard("VENDOR");
  const p = data.profile;

  return (
    <div className="space-y-6 lg:space-y-8">
      <DashboardHeading
        eyebrow={
          <>
            <Badge tone="brand">Expo &amp; Food Stall Vendor</Badge>
            <Badge tone="success">{String(p.status ?? "Active")}</Badge>
          </>
        }
        title={String(p.businessName ?? "Expo Vendor")}
        subtitle={`Owner / Contact: ${data.identity.fullName} • ${data.identity.email}`}
        actions={
          <Link href="/dashboard/vendor/stall" className={buttonClasses({ variant: "primary", size: "md" })}>
            <LuStore className="h-4 w-4" aria-hidden />
            View Stall &amp; Compliance
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Stall Category" value={String(p.stallCategory ?? "—")} hint="Expo zone" icon={LuStore} />
        <StatCard label="Stall Dimensions" value={String(p.stallSize ?? "3x3m")} hint={`Move-in: ${formatDate(moveInDay)}`} icon={LuShieldCheck} />
        <StatCard
          label="Electrical Power"
          value={p.electricPowerRequired ? "Requested" : "Not needed"}
          hint={p.fssaiNumber ? `FSSAI: ${String(p.fssaiNumber)}` : "Standard exhibitor booth"}
          icon={LuZap}
        />
      </div>

      <SectionCard
        title="Stall Registration Summary"
        tag={
          <Link href="/dashboard/vendor/profile" className={buttonClasses({ variant: "secondary", size: "sm" })}>
            Edit Business Profile
          </Link>
        }
      >
        <DetailList
          rows={[
            { label: "Business Name", value: String(p.businessName ?? "—") },
            { label: "Category", value: String(p.stallCategory ?? "—") },
            { label: "Size", value: String(p.stallSize ?? "—") },
            { label: "FSSAI Number", value: String(p.fssaiNumber || "Not applicable / Not provided") },
          ]}
        />
      </SectionCard>
    </div>
  );
}
