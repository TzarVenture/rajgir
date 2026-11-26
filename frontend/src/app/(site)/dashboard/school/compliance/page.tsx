import Link from "next/link";
import { requireGroupDashboard } from "@/lib/groupPartnerData";
import { DashboardHeading, DetailList, SectionCard } from "@/components/dashboard/DashboardParts";
import { Badge, Notice, buttonClasses } from "@/components/ui";

export const metadata = {
  title: "School Consent & Compliance | Rajgir Marathon 2027",
};

export default async function SchoolCompliancePage() {
  const data = await requireGroupDashboard("SCHOOL_COORDINATOR");
  const p = data.profile;

  return (
    <div className="space-y-6">
      <DashboardHeading
        eyebrow={<Badge tone="brand">Minor Safety &amp; Consent</Badge>}
        title="Parental Consent &amp; Contingent Compliance"
        subtitle="Safety verification and guardian declarations for your participating students."
        actions={
          <Link href="/dashboard/school/roster" className={buttonClasses({ variant: "primary", size: "md" })}>
            Manage Student Roster
          </Link>
        }
      />

      <Notice tone="success">
        Guardian &amp; institutional consent declaration is <strong>on file</strong> for {String(p.schoolName ?? "your school")}.
      </Notice>

      <SectionCard title="Compliance Record">
        <DetailList
          rows={[
            { label: "Institution", value: String(p.schoolName ?? "—") },
            { label: "Authorized Teacher In-Charge", value: String(p.teacherInCharge ?? "—") },
            { label: "Designation", value: String(p.teacherDesignation ?? "—") },
            { label: "Parental Consent Agreed", value: p.parentalConsentAgreed ? "Yes — Confirmed" : "Pending" },
            { label: "Registered Student Runners", value: `${data.quota.used} / ${data.quota.maxRunnerQuota}` },
          ]}
        />
      </SectionCard>
    </div>
  );
}
