import React from "react";
import Link from "next/link";
import {
  LuArrowLeft,
  LuCheck,
  LuCircleAlert,
  LuCircleCheck,
  LuClock,
  LuFileText,
  LuGlobe,
  LuInfo,
  LuMail,
  LuMegaphone,
  LuPhone,
  LuSparkles,
  LuTrash2,
  LuUser,
} from "react-icons/lu";
import { getInfluencerDashboardContext } from "@/lib/influencerDashboard";
import { RegistrationMissing } from "@/components/dashboard/ActionItems";
import { Badge, Button, Card, Notice } from "@/components/ui";
import { DetailList, SectionCard } from "@/components/dashboard/DashboardParts";
import { withdrawRegistration } from "@/app/actions/registerPeople";
import { EVENT, formatDate, formatDateTime } from "@/lib/event";

export const metadata = {
  title: "My Creator Proposal & Application | Rajgir Marathon 2027",
};

export default async function InfluencerApplicationPage() {
  const { load, data } = await getInfluencerDashboardContext("/dashboard/influencer/application");

  if (load.kind === "not-registered") {
    return <RegistrationMissing roleLabel="Influencer / Content Creator" registerHref="/register/influencer" />;
  }

  if (load.kind !== "ok" || !data) {
    return (
      <Notice tone="error" title="We could not load your proposal details">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const { inf, approved, rejected, creatorId, promoCode, mediaPassNumber } = data;
  const isPending = !approved && !rejected;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ---------- Clean Breadcrumbs & Header ---------- */}
      <div>
        <nav className="mb-2 flex items-center gap-2 text-xs font-semibold text-charcoal-500">
          <Link href="/dashboard/influencer" className="flex items-center gap-1 hover:text-brand-red transition-colors">
            <LuArrowLeft className="h-3.5 w-3.5" />
            <span>Influencer Hub</span>
          </Link>
          <span>/</span>
          <span className="text-charcoal-900">My Proposal</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-barlow text-2xl sm:text-3xl font-bold text-charcoal-900 tracking-tight">
              Creator Proposal &amp; Media Status
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-charcoal-600">
              Review your submitted collaboration pitch, track media committee approval, and manage your credentials.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="font-mono text-xs font-bold text-charcoal-700 bg-surface-soft border border-charcoal-200 px-3 py-1.5 rounded-btn shadow-2xs">
              Ref: {creatorId}
            </span>
          </div>
        </div>
      </div>

      {/* ---------- Primary Status Banner ---------- */}
      {approved ? (
        <div className="rounded-card border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6 text-emerald-950 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <LuCircleCheck className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                  Accreditation Confirmed
                </span>
                <h2 className="font-barlow text-xl sm:text-2xl font-bold text-emerald-950">
                  Official Media Partner Accreditation Active
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-emerald-800/90 leading-relaxed max-w-2xl">
                  Congratulations! Your channel pitch has been approved by the Rajgir Marathon PR Committee. Your official VIP press credential <strong>{mediaPassNumber}</strong> is ready for download.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/influencer/pass"
              className="inline-flex shrink-0 items-center justify-center rounded-btn bg-emerald-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xs hover:bg-emerald-800 transition-colors self-start sm:self-center"
            >
              <span>View Media Pass</span>
            </Link>
          </div>
        </div>
      ) : isPending ? (
        <div className="rounded-card border border-amber-200 bg-amber-50/70 p-5 sm:p-6 text-amber-950 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                <LuClock className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                  Media Committee Review
                </span>
                <h2 className="font-barlow text-xl sm:text-2xl font-bold text-amber-950">
                  Proposal Under Evaluation
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-amber-800/90 leading-relaxed max-w-2xl">
                  Thank you for submitting your collaboration proposal. Our PR team is evaluating your follower demographics and deliverables pitch. You will receive an email notification upon clearance.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
              <span className="text-xs font-semibold text-amber-900">Estimated Timeline</span>
              <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded">
                Within 48 – 72 hours
              </span>
            </div>
          </div>
        </div>
      ) : (
        <Notice tone="error" title="Proposal Declined">
          Your media proposal was not accepted for this edition. Please reach out to{" "}
          <a href={`mailto:${EVENT.contacts.helpEmail}`} className="underline font-semibold">
            {EVENT.contacts.helpEmail}
          </a>{" "}
          if you have any questions.
        </Notice>
      )}

      {/* ---------- 3-Stage Progress Timeline ---------- */}
      <Card padded={false} className="p-5 sm:p-6">
        <h3 className="font-barlow text-lg font-bold text-charcoal-900 mb-4">
          Accreditation Review Milestones
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Step 1 */}
          <div className="rounded-btn border border-charcoal-200 bg-surface-soft p-4 relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                ✓
              </span>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Stage 1 • Completed
              </span>
            </div>
            <h4 className="font-barlow text-base font-bold text-charcoal-900">Proposal Submitted</h4>
            <p className="text-xs text-charcoal-600 mt-1">
              Channel metrics and collaboration pitch received on {formatDate(inf.submittedAt)}.
            </p>
          </div>

          {/* Step 2 */}
          <div
            className={`rounded-btn border p-4 relative ${
              approved
                ? "border-charcoal-200 bg-surface-soft"
                : isPending
                  ? "border-amber-300 bg-amber-50/50 ring-2 ring-amber-400/20"
                  : "border-charcoal-200 bg-surface-soft"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  approved
                    ? "bg-emerald-600 text-white"
                    : isPending
                      ? "bg-amber-500 text-white animate-pulse"
                      : "bg-charcoal-200 text-charcoal-600"
                }`}
              >
                {approved ? "✓" : "2"}
              </span>
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  approved ? "text-emerald-800" : isPending ? "text-amber-800" : "text-charcoal-500"
                }`}
              >
                Stage 2 • {approved ? "Completed" : "In Progress"}
              </span>
            </div>
            <h4 className="font-barlow text-base font-bold text-charcoal-900">PR Evaluation</h4>
            <p className="text-xs text-charcoal-600 mt-1">
              Reviewing channel audience relevance, reach credibility, and content safety alignment.
            </p>
          </div>

          {/* Step 3 */}
          <div
            className={`rounded-btn border p-4 relative ${
              approved
                ? "border-emerald-200 bg-emerald-50/50"
                : "border-charcoal-200 bg-surface-soft opacity-75"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  approved ? "bg-emerald-600 text-white" : "bg-charcoal-200 text-charcoal-600"
                }`}
              >
                {approved ? "✓" : "3"}
              </span>
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  approved ? "text-emerald-800" : "text-charcoal-500"
                }`}
              >
                Stage 3 • {approved ? "Ready" : "Upcoming"}
              </span>
            </div>
            <h4 className="font-barlow text-base font-bold text-charcoal-900">Media Pass &amp; Kit</h4>
            <p className="text-xs text-charcoal-600 mt-1">
              Digital VIP pass unlocked and physical accreditation badge ready for Expo pickup.
            </p>
          </div>
        </div>
      </Card>

      {/* ---------- Section 3: Official Submission Record ---------- */}
      <Card padded={false} className="p-5 sm:p-6 space-y-4">
        <div className="border-b border-charcoal-100 pb-3">
          <h3 className="font-barlow text-xl font-bold text-charcoal-900 flex items-center gap-2">
            <LuFileText className="h-5 w-5 text-brand-red" />
            <span>Official Proposal Receipt</span>
          </h3>
          <p className="mt-0.5 text-xs sm:text-sm text-charcoal-600">
            Certified record of your submitted influencer registration details.
          </p>
        </div>

        <DetailList
          rows={[
            { label: "Creator Full Name", value: inf.fullName },
            { label: "Handle / Stage Name", value: inf.stageName || "—" },
            { label: "Contact Email", value: inf.email },
            { label: "Contact Phone", value: inf.phone },
            { label: "Primary Platform", value: inf.primaryPlatform },
            {
              label: "Channel URL",
              value: (
                <a
                  href={inf.profileUrl.startsWith("http") ? inf.profileUrl : `https://${inf.profileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-red font-mono text-xs hover:underline flex items-center gap-1"
                >
                  <span>{inf.profileUrl}</span>
                  <LuGlobe className="h-3 w-3" />
                </a>
              ),
            },
            { label: "Follower Count", value: inf.followerCount },
            { label: "Engagement Rate", value: inf.engagementRate || "—" },
            { label: "Target Content Niche", value: inf.targetNiche },
            { label: "City & Country", value: `${inf.city || "Patna"}, ${inf.country || "India"}` },
            { label: "Deliverables Proposal", value: inf.collaborationDeliverables },
            { label: "Submitted Timestamp", value: formatDateTime(inf.submittedAt) },
          ]}
        />

        {/* Withdrawal Notice if still pending */}
        {isPending ? (
          <div className="pt-4 border-t border-charcoal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-charcoal-500">
            <p>
              Need to withdraw your proposal or register under a different account category?
            </p>
            <form action={withdrawRegistration}>
              <Button type="submit" variant="secondary" size="sm" icon={LuTrash2}>
                Withdraw Proposal
              </Button>
            </form>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
