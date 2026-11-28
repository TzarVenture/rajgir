"use client";

import { useMemo, useState } from "react";
import { LuCheck, LuX } from "react-icons/lu";
import { adminReviewApplicationAction, adminReviewInfluencerAction, adminReviewQuotaAppealAction } from "@/app/actions/adminOps";
import type { ApiAdminApplications, ApiQuotaAppeal } from "@/lib/api";
import type { AdminInfluencer } from "@/lib/admin/sectionData";
import { Badge, Button, ChoiceChip } from "@/components/ui";
import { AdminTable, EmptyRow, Panel, StatusBadge, Toolbar, formatDateTime, matches, td, useAdminAction } from "@/components/admin/shared";

export type PartnerType = "corporate" | "school" | "sponsor" | "vendor" | "tourism";
type AppRow = ApiAdminApplications["corporates"][number];

/** How each application type is named and summarised. */
const PARTNER_META: Record<PartnerType, { label: string; list: keyof ApiAdminApplications; name: (r: AppRow) => string; detail: (r: AppRow) => string }> = {
  corporate: {
    label: "Corporate",
    list: "corporates",
    name: (r) => String(r.companyName ?? "Company"),
    detail: (r) => [r.estimatedPasses ? `${r.estimatedPasses} passes` : "", r.gstin ? `GSTIN ${r.gstin}` : ""].filter(Boolean).join(" | "),
  },
  school: {
    label: "School",
    list: "schools",
    name: (r) => String(r.schoolName ?? "School"),
    detail: (r) => [r.estimatedStudents ? `${r.estimatedStudents} students` : "", r.boardAffiliation, r.city].filter(Boolean).map(String).join(" | "),
  },
  sponsor: {
    label: "Sponsor",
    list: "sponsors",
    name: (r) => String(r.brandName ?? "Sponsor"),
    detail: (r) => [r.tierInterest, r.budgetBand, r.industry].filter(Boolean).map(String).join(" | "),
  },
  vendor: {
    label: "Vendor",
    list: "vendors",
    name: (r) => String(r.businessName ?? "Vendor"),
    detail: (r) => [r.stallCategory, r.stallSize, r.fssaiNumber ? `FSSAI ${r.fssaiNumber}` : ""].filter(Boolean).map(String).join(" | "),
  },
  tourism: {
    label: "Tourism",
    list: "tourism",
    name: (r) => String(r.businessName ?? "Tourism partner"),
    detail: (r) => [r.serviceType, r.location, r.inventoryCapacity ? `Capacity ${r.inventoryCapacity}` : ""].filter(Boolean).map(String).join(" | "),
  },
};

const isHotel = (r: AppRow) => /hotel|resort|homestay|stay/i.test(String(r.serviceType ?? ""));

type StatusFilter = "pending" | "all";

/** Application list with approve / reject, for one or more partner types. */
export function ApplicationsPanel({
  applications,
  types,
  filterRow,
  title = "Applications",
}: {
  applications: ApiAdminApplications;
  types: PartnerType[];
  filterRow?: (type: PartnerType, row: AppRow) => boolean;
  title?: string;
}) {
  const { run, confirmRun, pending } = useAdminAction();
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [search, setSearch] = useState("");

  const all = useMemo(
    () =>
      types.flatMap((type) =>
        (applications[PARTNER_META[type].list] ?? [])
          .filter((row) => (filterRow ? filterRow(type, row) : true))
          .map((row) => ({ type, row, name: PARTNER_META[type].name(row), detail: PARTNER_META[type].detail(row) })),
      ),
    [applications, types, filterRow],
  );
  const pendingCount = all.filter((a) => a.row.status === "pending").length;
  const shown = all.filter((a) => (status === "all" || a.row.status === "pending") && matches(search, a.name, a.detail, a.row.contact.fullName, a.row.contact.email));

  const review = (type: PartnerType, id: string, name: string, decision: "approve" | "reject") => {
    const action = () => adminReviewApplicationAction(type, id, decision);
    if (decision === "approve") run(action, `${name} approved.`);
    else confirmRun(`Reject ${name}? Their account will be suspended and they will no longer be able to sign in.`, action, `${name} rejected.`);
  };

  return (
    <div className="space-y-3">
      <Toolbar search={search} onSearch={setSearch} placeholder="Search organisation or contact...">
        <ChoiceChip selected={status === "pending"} onClick={() => setStatus("pending")}>
          Waiting ({pendingCount})
        </ChoiceChip>
        <ChoiceChip selected={status === "all"} onClick={() => setStatus("all")}>
          All ({all.length})
        </ChoiceChip>
      </Toolbar>
      <AdminTable
        columns={types.length > 1 ? ["Type", "Organisation", "Contact", "Submitted", "Status", "Actions"] : ["Organisation", "Contact", "Submitted", "Status", "Actions"]}
        isEmpty={shown.length === 0}
        empty={status === "pending" ? "Nothing waiting for approval." : "No applications yet."}
        caption={title}
      >
        {shown.map(({ type, row, name, detail }) => (
          <tr key={`${type}-${row.id}`}>
            {types.length > 1 ? (
              <td className={td}>
                <Badge tone="neutral">{PARTNER_META[type].label}</Badge>
              </td>
            ) : null}
            <td className={td}>
              <p className="font-semibold text-charcoal-900">{name}</p>
              {detail ? <p className="text-xs text-charcoal-500">{detail}</p> : null}
            </td>
            <td className={`${td} text-xs text-charcoal-600`}>
              {row.contact.fullName}
              <br />
              {row.contact.email} | {row.contact.phone || "-"}
            </td>
            <td className={`${td} text-xs text-charcoal-600`}>{formatDateTime(String(row.submittedAt ?? ""))}</td>
            <td className={td}>
              <StatusBadge status={row.status} />
            </td>
            <td className={td}>
              {row.status === "pending" ? (
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="primary" icon={LuCheck} disabled={pending} onClick={() => review(type, row.id, name, "approve")}>
                    Approve
                  </Button>
                  <Button type="button" size="sm" variant="secondary" icon={LuX} disabled={pending} onClick={() => review(type, row.id, name, "reject")}>
                    Reject
                  </Button>
                </div>
              ) : null}
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}

/** 50+ runner quota appeals from teams, companies and schools. */
export function QuotaAppealsPanel({ appeals, types }: { appeals: ApiQuotaAppeal[]; types: Array<ApiQuotaAppeal["type"]> }) {
  const { run, confirmRun, pending } = useAdminAction();
  const shown = appeals.filter((a) => types.includes(a.type));
  const waiting = shown.filter((a) => a.status === "PENDING").length;

  return (
    <Panel title={`50+ runner quota appeals (${waiting} waiting)`}>
      {shown.length === 0 ? (
        <EmptyRow>No quota appeals submitted.</EmptyRow>
      ) : (
        <ul className="divide-y divide-charcoal-100">
          {shown.map((a) => (
            <li key={`${a.type}-${a.id}`} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="brand">{a.type}</Badge>
                  <span className="break-words font-bold text-charcoal-900">{a.organizationName}</span>
                  <StatusBadge status={a.status} />
                </div>
                <p className="mt-1 break-words text-xs text-charcoal-600">
                  {a.contact.fullName} ({a.contact.email}) | Current limit <strong>{a.currentQuota}</strong>, requested <strong>{a.requestedQuota ?? "-"}</strong>
                  {a.submittedAt ? ` | ${formatDateTime(a.submittedAt)}` : ""}
                </p>
                {a.reason ? <p className="mt-1 break-words text-xs italic text-charcoal-500">&ldquo;{a.reason}&rdquo;</p> : null}
              </div>
              {a.status === "PENDING" ? (
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    icon={LuCheck}
                    disabled={pending || !a.requestedQuota}
                    onClick={() => run(() => adminReviewQuotaAppealAction(a.type, a.id, "approve", a.requestedQuota ?? undefined), `${a.organizationName}: limit raised to ${a.requestedQuota}.`)}
                  >
                    Approve {a.requestedQuota ?? ""}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    icon={LuX}
                    disabled={pending}
                    onClick={() => confirmRun(`Reject the quota appeal from ${a.organizationName}?`, () => adminReviewQuotaAppealAction(a.type, a.id, "reject"), `${a.organizationName}: appeal rejected.`)}
                  >
                    Reject
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/** Everything waiting for a decision, in one place. */
export function ApprovalsSection({ appeals, applications }: { appeals: ApiQuotaAppeal[]; applications: ApiAdminApplications }) {
  return (
    <div className="space-y-6">
      <ApplicationsPanel applications={applications} types={["corporate", "school", "sponsor", "vendor", "tourism"]} title="Group and partner applications" />
      <QuotaAppealsPanel appeals={appeals} types={["team", "corporate", "school"]} />
    </div>
  );
}

/** Sponsors, Vendors, Hotels, Tourism, Schools and Corporates pages. */
export function PartnerSection({
  slug,
  applications,
  appeals,
}: {
  slug: "sponsors" | "vendors" | "hotels" | "tourism" | "schools" | "corporates";
  applications: ApiAdminApplications;
  appeals: ApiQuotaAppeal[];
}) {
  switch (slug) {
    case "sponsors":
      return <ApplicationsPanel applications={applications} types={["sponsor"]} title="Sponsor applications" />;
    case "vendors":
      return <ApplicationsPanel applications={applications} types={["vendor"]} title="Vendor applications" />;
    case "hotels":
      return <ApplicationsPanel applications={applications} types={["tourism"]} filterRow={(_, r) => isHotel(r)} title="Hotel partners" />;
    case "tourism":
      return <ApplicationsPanel applications={applications} types={["tourism"]} filterRow={(_, r) => !isHotel(r)} title="Tourism partners" />;
    case "schools":
      return (
        <div className="space-y-6">
          <ApplicationsPanel applications={applications} types={["school"]} title="School applications" />
          <QuotaAppealsPanel appeals={appeals} types={["school"]} />
        </div>
      );
    case "corporates":
      return (
        <div className="space-y-6">
          <ApplicationsPanel applications={applications} types={["corporate"]} title="Corporate applications" />
          <QuotaAppealsPanel appeals={appeals} types={["corporate"]} />
        </div>
      );
  }
}

/** Influencer applications. Rejecting also suspends the creator's account (backend rule). */
export function InfluencersSection({ influencers }: { influencers: AdminInfluencer[] }) {
  const { run, confirmRun, pending } = useAdminAction();
  const [search, setSearch] = useState("");
  const rows = influencers.filter((i) => matches(search, i.fullName, i.email, i.primaryPlatform, String(i.stageName ?? "")));

  return (
    <div className="space-y-3">
      <Toolbar search={search} onSearch={setSearch} placeholder="Search creator, email, platform..." />
      <AdminTable columns={["Creator", "Platform", "Followers", "Status", "Actions"]} isEmpty={rows.length === 0} empty="No influencer applications yet." caption="Influencers">
        {rows.map((inf) => {
          const status = inf.status ?? "pending";
          return (
            <tr key={inf.id}>
              <td className={td}>
                <p className="font-semibold text-charcoal-900">
                  {inf.fullName}
                  {inf.stageName ? <span className="font-normal text-charcoal-500"> ({String(inf.stageName)})</span> : null}
                </p>
                <p className="text-xs text-charcoal-500">{inf.email}</p>
              </td>
              <td className={`${td} text-xs`}>
                {inf.primaryPlatform}
                {inf.profileUrl ? (
                  <>
                    <br />
                    <a href={String(inf.profileUrl)} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-brand-red hover:underline">
                      Profile
                    </a>
                  </>
                ) : null}
              </td>
              <td className={`${td} text-xs`}>{inf.followerCount}</td>
              <td className={td}>
                <StatusBadge status={status} />
              </td>
              <td className={td}>
                {status === "pending" ? (
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="primary" icon={LuCheck} disabled={pending} onClick={() => run(() => adminReviewInfluencerAction(inf.id, "approve"), `${inf.fullName} approved.`)}>
                      Approve
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      icon={LuX}
                      disabled={pending}
                      onClick={() =>
                        confirmRun(`Reject ${inf.fullName}? Their account will be suspended.`, () => adminReviewInfluencerAction(inf.id, "reject"), `${inf.fullName} rejected.`)
                      }
                    >
                      Reject
                    </Button>
                  </div>
                ) : null}
              </td>
            </tr>
          );
        })}
      </AdminTable>
    </div>
  );
}
