import React from "react";
import Link from "next/link";
import { LuArrowLeft, LuBadgeCheck, LuUserRound } from "react-icons/lu";
import { getInfluencerDashboardContext } from "@/lib/influencerDashboard";
import { RegistrationMissing } from "@/components/dashboard/ActionItems";
import { Badge, Notice } from "@/components/ui";
import { InfluencerProfileHub } from "@/components/dashboard/influencer/InfluencerProfileHub";
import { EVENT } from "@/lib/event";

export const metadata = {
  title: "Creator Profile & Account Settings | Rajgir Marathon 2027",
};

export default async function InfluencerProfilePage() {
  const { load, data } = await getInfluencerDashboardContext("/dashboard/influencer/profile");

  if (load.kind === "not-registered") {
    return <RegistrationMissing roleLabel="Influencer / Content Creator" registerHref="/register/influencer" />;
  }

  if (load.kind !== "ok" || !data) {
    return (
      <Notice tone="error" title="We could not load your profile details">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const { inf, approved, creatorId, promoCode, mediaPassNumber } = data;

  return (
    <div className="space-y-6 lg:space-y-8 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-charcoal-200 pb-5">
        <div>
          <Link
            href="/dashboard/influencer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-brand-red transition-colors mb-2"
          >
            <LuArrowLeft className="h-3.5 w-3.5" aria-hidden />
            <span>Back to Influencer Hub</span>
          </Link>
          <h1 className="font-barlow text-2xl sm:text-3xl font-bold text-charcoal-900 flex items-center gap-2.5">
            <LuUserRound className="h-7 w-7 text-brand-red" aria-hidden />
            <span>Creator Profile &amp; Account Settings</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-charcoal-600">
            View your media channel metrics, update account login password, and manage your credentials.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{inf.primaryPlatform}</Badge>
          <Badge tone="success">
            <LuBadgeCheck className="h-3.5 w-3.5" aria-hidden /> {approved ? "Approved Creator" : "Media Member"}
          </Badge>
        </div>
      </div>

      {/* Main Interactive Hub */}
      <InfluencerProfileHub
        initial={{
          fullName: inf.fullName,
          stageName: inf.stageName,
          email: inf.email,
          phone: inf.phone,
          creatorId,
          city: inf.city,
          country: inf.country,
          primaryPlatform: inf.primaryPlatform,
          profileUrl: inf.profileUrl,
          followerCount: inf.followerCount,
          engagementRate: inf.engagementRate,
          targetNiche: inf.targetNiche,
          collaborationDeliverables: inf.collaborationDeliverables,
          submittedAt: inf.submittedAt,
          status: inf.status,
          promoCode,
          mediaPassNumber,
        }}
      />
    </div>
  );
}
