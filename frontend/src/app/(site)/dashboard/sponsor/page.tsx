import Link from "next/link";
import { LuAward, LuBriefcase, LuGlobe, LuTicket } from "react-icons/lu";
import { requirePartnerDashboard } from "@/lib/groupPartnerData";
import { DashboardHeading, DetailList, SectionCard } from "@/components/dashboard/DashboardParts";
import { Badge, StatCard, buttonClasses } from "@/components/ui";

export const metadata = {
  title: "Official Sponsor Dashboard | Rajgir Marathon 2027",
};

export default async function SponsorOverviewPage() {
  const data = await requirePartnerDashboard("SPONSOR");
  const p = data.profile;

  return (
    <div className="space-y-6 lg:space-y-8">
      <DashboardHeading
        eyebrow={
          <>
            <Badge tone="brand">Official Marathon Sponsor</Badge>
            <Badge tone="success">{String(p.status ?? "Active")}</Badge>
          </>
        }
        title={String(p.brandName ?? "Sponsor Partner")}
        subtitle={`Brand Lead: ${data.identity.fullName} • ${data.identity.email}`}
        actions={
          <Link href="/dashboard/sponsor/deliverables" className={buttonClasses({ variant: "primary", size: "md" })}>
            <LuAward className="h-4 w-4" aria-hidden />
            View Deliverables &amp; VIP Passes
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sponsorship Tier" value={String(p.tierInterest ?? "—")} hint="Partnership level" icon={LuAward} />
        <StatCard label="Budget Band" value={String(p.budgetBand ?? "—")} hint="Committed package" icon={LuTicket} />
        <StatCard label="Industry" value={String(p.industry ?? "—")} hint="Brand category" icon={LuBriefcase} />
        <StatCard label="Website" value={String(p.brandWebsite || "Not set")} hint="Public sponsor link" icon={LuGlobe} />
      </div>

      <SectionCard
        title="Sponsorship Summary"
        tag={
          <Link href="/dashboard/sponsor/profile" className={buttonClasses({ variant: "secondary", size: "sm" })}>
            Edit Brand Profile
          </Link>
        }
      >
        <DetailList
          rows={[
            { label: "Brand Name", value: String(p.brandName ?? "—") },
            { label: "Tier Interest", value: String(p.tierInterest ?? "—") },
            { label: "Proposal Deliverables", value: String(p.proposalDeliverables || "Standard branding & VIP tent") },
          ]}
        />
      </SectionCard>
    </div>
  );
}
