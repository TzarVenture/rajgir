"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LuCheck, LuShieldAlert, LuUsers, LuX } from "react-icons/lu";
import { reviewApplicationAdminAction, reviewQuotaAppealAdminAction } from "@/app/actions/groupOps";
import type { ApiAdminApplications, ApiQuotaAppeal } from "@/lib/api";
import { Badge, Button, Notice } from "@/components/ui";

export function LiveApprovalsClient({
  appeals: initialAppeals,
  applications: initialApps,
}: {
  appeals: ApiQuotaAppeal[];
  applications: ApiAdminApplications;
}) {
  const router = useRouter();
  const [appeals, setAppeals] = useState(initialAppeals);
  const [apps, setApps] = useState(initialApps);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const handleAppeal = (appeal: ApiQuotaAppeal, decision: "approve" | "reject") => {
    setError("");
    setFeedback("");
    startTransition(async () => {
      const res = await reviewQuotaAppealAdminAction(
        appeal.type,
        appeal.id,
        decision,
        decision === "approve" ? appeal.requestedQuota ?? undefined : undefined
      );
      if (!res.success) {
        setError(res.error ?? "Failed to process appeal.");
        return;
      }
      setAppeals((prev) =>
        prev.map((a) =>
          a.id === appeal.id && a.type === appeal.type
            ? { ...a, status: decision === "approve" ? "APPROVED" : "REJECTED" }
            : a
        )
      );
      setFeedback(`${appeal.organizationName}: Quota appeal ${decision === "approve" ? "approved" : "rejected"}.`);
      router.refresh();
    });
  };

  const handleApplication = (
    type: "corporate" | "school" | "sponsor" | "vendor" | "tourism",
    id: string,
    name: string,
    decision: "approve" | "reject"
  ) => {
    setError("");
    setFeedback("");
    startTransition(async () => {
      const res = await reviewApplicationAdminAction(type, id, decision);
      if (!res.success) {
        setError(res.error ?? "Failed to update application.");
        return;
      }
      const key = type === "corporate" ? "corporates" : type === "school" ? "schools" : type === "sponsor" ? "sponsors" : type === "vendor" ? "vendors" : "tourism";
      setApps((prev) => ({
        ...prev,
        [key]: prev[key].map((item) =>
          item.id === id ? { ...item, status: decision === "approve" ? "approved" : "rejected" } : item
        ),
      }));
      setFeedback(`${name}: Application ${decision === "approve" ? "approved" : "rejected"}.`);
      router.refresh();
    });
  };

  const flatApps = [
    ...apps.corporates.map((c) => ({ type: "corporate" as const, id: c.id, name: String(c.companyName ?? "Corporate"), detail: `${String(c.estimatedPasses ?? 0)} passes`, status: c.status, contact: c.contact })),
    ...apps.schools.map((s) => ({ type: "school" as const, id: s.id, name: String(s.schoolName ?? "School"), detail: `${String(s.estimatedStudents ?? 0)} students`, status: s.status, contact: s.contact })),
    ...apps.sponsors.map((s) => ({ type: "sponsor" as const, id: s.id, name: String(s.brandName ?? "Sponsor"), detail: String(s.tierInterest ?? ""), status: s.status, contact: s.contact })),
    ...apps.vendors.map((v) => ({ type: "vendor" as const, id: v.id, name: String(v.businessName ?? "Vendor"), detail: String(v.stallCategory ?? ""), status: v.status, contact: v.contact })),
    ...apps.tourism.map((t) => ({ type: "tourism" as const, id: t.id, name: String(t.businessName ?? "Tourism"), detail: String(t.serviceType ?? ""), status: t.status, contact: t.contact })),
  ];

  return (
    <div className="space-y-8">
      {error && <Notice tone="error">{error}</Notice>}
      {feedback && <Notice tone="success">{feedback}</Notice>}

      {/* Section 1: 50+ Runner Quota Appeals */}
      <section className="rounded-card border border-charcoal-200 bg-white overflow-hidden">
        <div className="border-b border-charcoal-200 px-5 py-4 flex items-center gap-2">
          <LuShieldAlert className="h-5 w-5 text-brand-red" />
          <h2 className="text-lg font-extrabold text-charcoal-900">
            50+ Runner Quota Appeals ({appeals.length})
          </h2>
        </div>

        {appeals.length === 0 ? (
          <div className="p-6 text-sm text-charcoal-500">No quota appeals submitted yet.</div>
        ) : (
          <div className="divide-y divide-charcoal-100">
            {appeals.map((a) => (
              <div key={`${a.type}-${a.id}`} className="flex flex-col gap-3 p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="brand">{a.type.toUpperCase()}</Badge>
                    <h3 className="break-words font-bold text-charcoal-900">{a.organizationName}</h3>
                    <Badge tone={a.status === "APPROVED" ? "success" : a.status === "REJECTED" ? "error" : "warning"}>
                      {a.status}
                    </Badge>
                  </div>
                  <p className="mt-1 break-words text-xs text-charcoal-600">
                    Contact: {a.contact.fullName} ({a.contact.email}) • Current: <strong>{a.currentQuota}</strong> ➔ Requested:{" "}
                    <strong>{a.requestedQuota}</strong>
                  </p>
                  {a.reason && <p className="mt-1 break-words text-xs italic text-charcoal-500">&ldquo;{a.reason}&rdquo;</p>}
                </div>
                {a.status === "PENDING" && (
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button type="button" size="sm" variant="primary" icon={LuCheck} disabled={pending} onClick={() => handleAppeal(a, "approve")}>
                      Approve ({a.requestedQuota})
                    </Button>
                    <Button type="button" size="sm" variant="secondary" icon={LuX} disabled={pending} onClick={() => handleAppeal(a, "reject")}>
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Group & Partner Applications */}
      <section className="rounded-card border border-charcoal-200 bg-white overflow-hidden">
        <div className="border-b border-charcoal-200 px-5 py-4 flex items-center gap-2">
          <LuUsers className="h-5 w-5 text-brand-red" />
          <h2 className="text-lg font-extrabold text-charcoal-900">
            Group &amp; Partner Applications ({flatApps.length})
          </h2>
        </div>

        {flatApps.length === 0 ? (
          <div className="p-6 text-sm text-charcoal-500">No applications found in database.</div>
        ) : (
          <div className="divide-y divide-charcoal-100">
            {flatApps.map((app) => (
              <div key={`${app.type}-${app.id}`} className="flex flex-col gap-3 p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="neutral">{app.type.toUpperCase()}</Badge>
                    <h3 className="break-words font-bold text-charcoal-900">{app.name}</h3>
                    <Badge tone={app.status === "approved" ? "success" : app.status === "rejected" ? "error" : "warning"}>
                      {app.status}
                    </Badge>
                  </div>
                  <p className="mt-1 break-words text-xs text-charcoal-600">
                    {app.contact.fullName} ({app.contact.email}) • {app.detail}
                  </p>
                </div>
                {app.status === "pending" && (
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button type="button" size="sm" variant="primary" icon={LuCheck} disabled={pending} onClick={() => handleApplication(app.type, app.id, app.name, "approve")}>
                      Approve
                    </Button>
                    <Button type="button" size="sm" variant="secondary" icon={LuX} disabled={pending} onClick={() => handleApplication(app.type, app.id, app.name, "reject")}>
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
