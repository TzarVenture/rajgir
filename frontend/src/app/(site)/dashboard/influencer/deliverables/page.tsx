import React from "react";
import Link from "next/link";
import { getInfluencerDashboardContext } from "@/lib/influencerDashboard";
import { RegistrationMissing } from "@/components/dashboard/ActionItems";
import { Badge, Notice } from "@/components/ui";
import { SectionCard } from "@/components/dashboard/DashboardParts";
import { InfluencerSubpageHeader } from "@/components/dashboard/influencer/InfluencerSubpageHeader";
import { DeliverablesManager } from "@/components/dashboard/influencer/DeliverablesManager";
import { EVENT } from "@/lib/event";

export const metadata = {
  title: "Campaign Deliverables & Content Tracker | Rajgir Marathon 2027",
};

export default async function InfluencerDeliverablesPage() {
  const { load, data } = await getInfluencerDashboardContext("/dashboard/influencer/deliverables");

  if (load.kind === "not-registered") {
    return <RegistrationMissing roleLabel="Influencer / Content Creator" registerHref="/register/influencer" />;
  }

  if (load.kind !== "ok" || !data) {
    return (
      <Notice tone="error" title="We could not load your deliverables">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const { inf, approved, deliverablesList } = data;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Subpage Header with Navigation Tabs */}
      <InfluencerSubpageHeader
        title="Campaign Deliverables & Content Tracker"
        description="Submit links to your published promotional reels, shorts, kit unboxings, and race day stories for official PR clearance."
        creatorName={inf.fullName}
        stageName={inf.stageName}
        primaryPlatform={inf.primaryPlatform}
        followerCount={inf.followerCount}
        approved={approved}
        activeHref="/dashboard/influencer/deliverables"
      />

      {/* Main Interactive Deliverables Manager */}
      <DeliverablesManager
        initialDeliverables={deliverablesList}
        creatorHandle={inf.stageName || inf.fullName}
      />
    </div>
  );
}
