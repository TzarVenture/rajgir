import Link from "next/link";
import { LuGraduationCap, LuMapPin, LuShieldCheck, LuUsers } from "react-icons/lu";
import { requireGroupDashboard } from "@/lib/groupPartnerData";
import { DashboardHeading, DetailList, SectionCard } from "@/components/dashboard/DashboardParts";
import { Badge, StatCard, buttonClasses } from "@/components/ui";

export const metadata = {
  title: "School & College Dashboard | Rajgir Marathon 2027",
};

export default async function SchoolOverviewPage() {
  const data = await requireGroupDashboard("SCHOOL_COORDINATOR");
  const p = data.profile;

  return (
    <div className="space-y-6 lg:space-y-8">
      <DashboardHeading
        eyebrow={
          <>
            <Badge tone="brand">School / College Contingent</Badge>
            <Badge tone="success">Active</Badge>
          </>
        }
        title={String(p.schoolName ?? "School Contingent")}
        subtitle={`Coordinator: ${data.identity.fullName} • ${data.identity.email}`}
        actions={
          <Link href="/dashboard/school/roster" className={buttonClasses({ variant: "primary", size: "md" })}>
            <LuUsers className="h-4 w-4" aria-hidden />
            Add Students (Manual / Excel)
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students Registered" value={`${data.quota.used} / ${data.quota.maxRunnerQuota}`} hint={`${data.quota.remaining} slots remaining`} icon={LuUsers} />
        <StatCard label="Planned Contingent" value={String(p.estimatedStudents ?? "—")} hint={String(p.boardAffiliation ?? "CBSE / ICSE / State")} icon={LuGraduationCap} />
        <StatCard label="City" value={String(p.city ?? "Rajgir")} hint="Institution location" icon={LuMapPin} />
        <StatCard label="Parental Consent" value={p.parentalConsentAgreed ? "Verified" : "Pending"} hint="Required for minor runners" icon={LuShieldCheck} />
      </div>

      <SectionCard
        title="Institution Details"
        tag={
          <Link href="/dashboard/school/profile" className={buttonClasses({ variant: "secondary", size: "sm" })}>
            Edit School Profile
          </Link>
        }
      >
        <DetailList
          rows={[
            { label: "School / College Name", value: String(p.schoolName ?? "—") },
            { label: "Board / University", value: String(p.boardAffiliation ?? "—") },
            { label: "Teacher In-Charge", value: `${String(p.teacherInCharge ?? "—")} (${String(p.teacherDesignation ?? "")})` },
            { label: "Quota Appeal Status", value: data.quota.appealStatus === "NONE" ? "Standard (50)" : data.quota.appealStatus },
          ]}
        />
      </SectionCard>
    </div>
  );
}
