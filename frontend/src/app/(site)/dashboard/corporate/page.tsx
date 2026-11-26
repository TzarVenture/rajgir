import Link from "next/link";
import { LuBuilding2, LuReceipt, LuShieldCheck, LuUsers } from "react-icons/lu";
import { requireGroupDashboard } from "@/lib/groupPartnerData";
import { DashboardHeading, DetailList, SectionCard } from "@/components/dashboard/DashboardParts";
import { Badge, StatCard, buttonClasses } from "@/components/ui";

export const metadata = {
  title: "Corporate Delegation Dashboard | Rajgir Marathon 2027",
};

export default async function CorporateOverviewPage() {
  const data = await requireGroupDashboard("CORPORATE_MANAGER");
  const p = data.profile;

  return (
    <div className="space-y-6 lg:space-y-8">
      <DashboardHeading
        eyebrow={
          <>
            <Badge tone="brand">Corporate Wellness Delegation</Badge>
            <Badge tone="success">Active</Badge>
          </>
        }
        title={String(p.companyName ?? "Corporate Delegation")}
        subtitle={`Manager: ${data.identity.fullName} (${String(p.designation ?? "HR / Admin")}) • ${data.identity.email}`}
        actions={
          <Link href="/dashboard/corporate/roster" className={buttonClasses({ variant: "primary", size: "md" })}>
            <LuUsers className="h-4 w-4" aria-hidden />
            Add Employees (Manual / Excel)
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Employees Registered" value={`${data.quota.used} / ${data.quota.maxRunnerQuota}`} hint={`${data.quota.remaining} slots remaining`} icon={LuUsers} />
        <StatCard label="Planned Passes" value={String(p.estimatedPasses ?? "—")} hint="Requested at onboarding" icon={LuBuilding2} />
        <StatCard label="GSTIN" value={String(p.gstin || "Not provided")} hint="For corporate tax invoice" icon={LuReceipt} />
        <StatCard
          label="Quota Appeal"
          value={data.quota.appealStatus === "NONE" ? "Standard (50)" : data.quota.appealStatus}
          hint="50+ runner requests"
          icon={LuShieldCheck}
        />
      </div>

      <SectionCard
        title="Corporate Profile Summary"
        tag={
          <Link href="/dashboard/corporate/profile" className={buttonClasses({ variant: "secondary", size: "sm" })}>
            Edit Company Profile
          </Link>
        }
      >
        <DetailList
          rows={[
            { label: "Company Name", value: String(p.companyName ?? "—") },
            { label: "Official Email Domain", value: String(p.officialEmailDomain || "—") },
            { label: "Coordinator Designation", value: String(p.designation || "—") },
            { label: "CSR Focus", value: String(p.csrFocus || "Employee Wellness") },
          ]}
        />
      </SectionCard>
    </div>
  );
}
