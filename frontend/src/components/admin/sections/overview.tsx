"use client";

import Link from "next/link";
import { LuActivity, LuArrowRight, LuDownload, LuShieldCheck, LuSiren, LuUsers } from "react-icons/lu";
import type { ApiAdminOverview, ApiRunnerRegistration } from "@/lib/api";
import { Badge, Button, Notice, StatCard } from "@/components/ui";
import { AdminTable, Panel, formatINR, td } from "@/components/admin/shared";
import { downloadRunnersWorkbook, downloadTshirtWorkbook } from "@/components/admin/exports";

const istDay = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) : "";
export const todayIST = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

/** Registrations created today (India time). */
export function registeredToday(runners: ApiRunnerRegistration[]) {
  const today = todayIST();
  return runners.filter((r) => istDay(r.createdAt) === today);
}

function revenueByCategory(overview: ApiAdminOverview, runners: ApiRunnerRegistration[]) {
  return overview.categoryBreakdown
    .map((c) => {
      const inCategory = runners.filter((r) => r.distance === c.distance);
      return {
        distance: c.distance,
        count: c.count,
        revenue: inCategory.reduce((s, r) => s + (r.netAmount ?? 0), 0),
        share: overview.totalRunners > 0 ? Math.round((c.count / overview.totalRunners) * 100) : 0,
      };
    })
    .sort((a, b) => b.count - a.count);
}

/** Shown when the registrations list is capped below the real total, so sums would be partial. */
function PartialNotice({ overview, runners }: { overview: ApiAdminOverview; runners: ApiRunnerRegistration[] }) {
  if (runners.length >= overview.totalRunners) return null;
  return (
    <Notice tone="warning">
      Showing calculations for the latest {runners.length} of {overview.totalRunners} registrations. Totals at the top are exact.
    </Notice>
  );
}

function KpiRow({ overview, runners }: { overview: ApiAdminOverview; runners: ApiRunnerRegistration[] }) {
  const today = registeredToday(runners);
  const todaysRevenue = today.reduce((s, r) => s + (r.netAmount ?? 0), 0);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total runners" value={String(overview.totalRunners)} hint={`${today.length} registered today`} icon={LuUsers} />
      <StatCard label="Net revenue" value={formatINR(overview.totalRevenue)} hint={`${formatINR(todaysRevenue)} today`} icon={LuActivity} />
      <StatCard
        label="Kits collected"
        value={String(overview.kitsCollectedCount)}
        hint={`${Math.max(0, overview.totalRunners - overview.kitsCollectedCount)} still to collect`}
        icon={LuShieldCheck}
      />
      <StatCard label="Open incidents" value={String(overview.openIncidentsCount)} hint="Not yet resolved" icon={LuSiren} />
    </div>
  );
}

export function DashboardSection({ overview, runners }: { overview: ApiAdminOverview; runners: ApiRunnerRegistration[] }) {
  const attention = [
    { label: "Applications waiting for approval", count: overview.pendingApprovalsCount, href: "/admin/approvals" },
    { label: "50+ runner quota appeals", count: overview.pendingQuotaAppealsCount, href: "/admin/approvals" },
    { label: "Open incidents and SOS alerts", count: overview.openIncidentsCount, href: "/admin/live-race" },
    { label: "Kits not yet collected", count: Math.max(0, overview.totalRunners - overview.kitsCollectedCount), href: "/admin/check-ins" },
  ];
  return (
    <div className="space-y-6">
      <KpiRow overview={overview} runners={runners} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Needs attention">
          <ul className="divide-y divide-charcoal-100">
            {attention.map((a) => (
              <li key={a.label}>
                <Link href={a.href} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-charcoal-50">
                  <span className="text-charcoal-800">{a.label}</span>
                  <span className="flex items-center gap-2">
                    <Badge tone={a.count > 0 ? "warning" : "success"}>{a.count}</Badge>
                    <LuArrowRight className="h-4 w-4 text-charcoal-400" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Participants">
          <dl className="grid grid-cols-2 gap-4 p-5 text-sm">
            {[
              ["Runners", overview.totalRunners],
              ["Volunteers", overview.totalVolunteers],
              ["Influencers", overview.totalInfluencers],
              ["Teams, schools and companies", overview.totalGroups],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <dt className="text-charcoal-500">{label}</dt>
                <dd className="font-barlow text-2xl font-bold text-charcoal-900">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </div>
  );
}

export function RevenueSection({ overview, runners }: { overview: ApiAdminOverview; runners: ApiRunnerRegistration[] }) {
  const rows = revenueByCategory(overview, runners);
  const addOnRevenue = runners.reduce(
    (s, r) => s + (Array.isArray(r.selectedAddons) ? r.selectedAddons.reduce((a, x) => a + (Number(x?.price) || 0), 0) : 0),
    0,
  );
  const discounts = runners.reduce((s, r) => s + (r.discountAmount ?? 0), 0);
  return (
    <div className="space-y-6">
      <KpiRow overview={overview} runners={runners} />
      <PartialNotice overview={overview} runners={runners} />
      <AdminTable columns={["Category", "Registrations", "Share", "Net revenue"]} isEmpty={rows.length === 0} empty="No registrations yet." caption="Revenue by category">
        {rows.map((r) => (
          <tr key={r.distance}>
            <td className={`${td} font-semibold text-charcoal-900`}>{r.distance}</td>
            <td className={td}>{r.count}</td>
            <td className={td}>{r.share}%</td>
            <td className={`${td} font-semibold`}>{formatINR(r.revenue)}</td>
          </tr>
        ))}
      </AdminTable>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Add-on sales (included above)" value={formatINR(addOnRevenue)} hint="Hoodies, shuttles, meals and other extras" />
        <StatCard label="Coupon discounts given" value={formatINR(discounts)} hint="Already deducted from net revenue" />
      </div>
      <p className="text-xs text-charcoal-500">
        Revenue is the net amount of registrations. Manually recorded payments and refunds are on the{" "}
        <Link href="/admin/payments" className="font-semibold text-brand-red hover:underline">
          Payments
        </Link>{" "}
        page.
      </p>
    </div>
  );
}

export function AnalyticsSection({ overview }: { overview: ApiAdminOverview }) {
  const kitPct = overview.totalRunners > 0 ? Math.round((overview.kitsCollectedCount / overview.totalRunners) * 100) : 0;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Registrations by category">
        <div className="space-y-3 p-5">
          {overview.categoryBreakdown.length === 0 ? <p className="text-sm text-charcoal-500">No registrations yet.</p> : null}
          {overview.categoryBreakdown.map((c) => {
            const pct = overview.totalRunners > 0 ? Math.round((c.count / overview.totalRunners) * 100) : 0;
            return (
              <div key={c.distance}>
                <div className="mb-1 flex justify-between text-xs font-bold text-charcoal-700">
                  <span>{c.distance}</span>
                  <span>
                    {c.count} ({pct}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-charcoal-100" aria-hidden>
                  <div className="h-full rounded-full bg-brand-red" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
      <div className="space-y-6">
        <Panel title="T-shirt sizes">
          <div className="flex flex-wrap gap-2 p-5">
            {overview.tshirtBreakdown.length === 0 ? <p className="text-sm text-charcoal-500">No registrations yet.</p> : null}
            {overview.tshirtBreakdown.map((t) => (
              <Badge key={t.size} tone="neutral">
                {t.size}: {t.count}
              </Badge>
            ))}
          </div>
        </Panel>
        <Panel title="Kit collection">
          <div className="p-5">
            <p className="text-sm text-charcoal-700">
              {overview.kitsCollectedCount} of {overview.totalRunners} kits collected ({kitPct}%).
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-charcoal-100" aria-hidden>
              <div className="h-full rounded-full bg-[#16A34A]" style={{ width: `${kitPct}%` }} />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function ReportsSection({ overview, runners }: { overview: ApiAdminOverview; runners: ApiRunnerRegistration[] }) {
  const reports = [
    {
      title: "Master runner list",
      detail: "Every registration with bib, contact, category, T-shirt, amount and kit status.",
      onClick: () => downloadRunnersWorkbook(runners, "rajgir_marathon_runners.xlsx"),
    },
    {
      title: "T-shirt size summary",
      detail: "Count per size, for kit procurement.",
      onClick: () => downloadTshirtWorkbook(overview),
    },
    {
      title: "Kits still to collect",
      detail: "Runners who have not collected their race kit yet.",
      onClick: () => downloadRunnersWorkbook(runners.filter((r) => !r.kitCollectedAt), "rajgir_marathon_kits_pending.xlsx"),
    },
  ];
  return (
    <div className="space-y-4">
      <PartialNotice overview={overview} runners={runners} />
      <div className="grid gap-4 md:grid-cols-3">
        {reports.map((r) => (
          <Panel key={r.title} title={r.title}>
            <div className="space-y-4 p-5">
              <p className="text-sm text-charcoal-600">{r.detail}</p>
              <Button type="button" size="sm" variant="secondary" icon={LuDownload} onClick={r.onClick}>
                Download .xlsx
              </Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
