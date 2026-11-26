import Link from "next/link";
import { requireGroupDashboard } from "@/lib/groupPartnerData";
import { DashboardHeading, DetailList, SectionCard } from "@/components/dashboard/DashboardParts";
import { Badge, buttonClasses } from "@/components/ui";

export const metadata = {
  title: "GST & Corporate Billing | Rajgir Marathon 2027",
};

export default async function CorporateBillingPage() {
  const data = await requireGroupDashboard("CORPORATE_MANAGER");
  const p = data.profile;

  return (
    <div className="space-y-6">
      <DashboardHeading
        eyebrow={<Badge tone="brand">GST &amp; Invoicing</Badge>}
        title="Corporate Billing &amp; Tax Details"
        subtitle="Review your GSTIN and billing address used for corporate tax invoices."
        actions={
          <Link href="/dashboard/corporate/profile" className={buttonClasses({ variant: "secondary", size: "md" })}>
            Update GST / Billing Info
          </Link>
        }
      />
      <SectionCard title="Registered Billing Information">
        <DetailList
          rows={[
            { label: "Legal Company Name", value: String(p.companyName ?? "—") },
            { label: "GSTIN", value: String(p.gstin || "Not provided yet") },
            { label: "Billing Address", value: String(p.billingAddress || "Not provided yet") },
            { label: "Active Registered Employees", value: `${data.quota.used} runners` },
            { label: "Approved Quota Limit", value: `${data.quota.maxRunnerQuota} runners` },
          ]}
        />
      </SectionCard>
    </div>
  );
}
