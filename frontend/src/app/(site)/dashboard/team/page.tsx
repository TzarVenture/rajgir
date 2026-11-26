import Link from "next/link";
import { LuHash, LuMapPin, LuShieldCheck, LuUsers } from "react-icons/lu";
import { requireGroupDashboard } from "@/lib/groupPartnerData";
import { DashboardHeading, DetailList, SectionCard } from "@/components/dashboard/DashboardParts";
import { Badge, StatCard, buttonClasses } from "@/components/ui";

export const metadata = {
  title: "Team & Running Club Dashboard | Rajgir Marathon 2027",
};

export default async function TeamOverviewPage() {
  const data = await requireGroupDashboard("TEAM_CAPTAIN");
  const p = data.profile;

  return (
    <div className="space-y-6 lg:space-y-8">
      <DashboardHeading
        eyebrow={
          <>
            <Badge tone="brand">Running Club / Team Captain</Badge>
            <Badge tone="success">Active</Badge>
          </>
        }
        title={String(p.teamName ?? "Your Running Club")}
        subtitle={`Captain: ${data.identity.fullName} • ${data.identity.email} • ${data.identity.phone || "No phone"}`}
        actions={
          <Link href="/dashboard/team/roster" className={buttonClasses({ variant: "primary", size: "md" })}>
            <LuUsers className="h-4 w-4" aria-hidden />
            Manage Squad &amp; Add Runners
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Team Join Code" value={String(p.teamJoinCode ?? "—")} hint="Share with self-registering runners" icon={LuHash} />
        <StatCard label="Runners Registered" value={`${data.quota.used} / ${data.quota.maxRunnerQuota}`} hint={`${data.quota.remaining} slots remaining`} icon={LuUsers} />
        <StatCard label="City" value={String(p.city ?? "Rajgir")} hint="Home club base" icon={LuMapPin} />
        <StatCard
          label="Quota Appeal"
          value={data.quota.appealStatus === "NONE" ? "Standard (50)" : data.quota.appealStatus}
          hint={data.quota.appealRequestedQuota ? `Requested: ${data.quota.appealRequestedQuota}` : "Default limit"}
          icon={LuShieldCheck}
        />
      </div>

      <SectionCard
        title="Club Details"
        tag={
          <Link href="/dashboard/team/profile" className={buttonClasses({ variant: "secondary", size: "sm" })}>
            Edit Club Profile
          </Link>
        }
      >
        <DetailList
          rows={[
            { label: "Team / Club Name", value: String(p.teamName ?? "—") },
            { label: "Affiliation", value: String(p.clubAffiliation || "Independent") },
            { label: "Team Join Code", value: String(p.teamJoinCode ?? "—") },
            { label: "Estimated Members", value: String(p.estimatedMembers ?? "—") },
          ]}
        />
      </SectionCard>
    </div>
  );
}
