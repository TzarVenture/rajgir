import React from "react";
import Link from "next/link";
import { getInfluencerDashboardContext } from "@/lib/influencerDashboard";
import { RegistrationMissing } from "@/components/dashboard/ActionItems";
import { Badge, Notice } from "@/components/ui";
import { InfluencerSubpageHeader } from "@/components/dashboard/influencer/InfluencerSubpageHeader";
import { BrandKitHub } from "@/components/dashboard/influencer/BrandKitHub";
import { EVENT } from "@/lib/event";

export const metadata = {
  title: "Brand Kit, Promo Code & Media Assets | Rajgir Marathon 2027",
};

export default async function InfluencerBrandKitPage() {
  const { load, data } = await getInfluencerDashboardContext("/dashboard/influencer/brand-kit");

  if (load.kind === "not-registered") {
    return <RegistrationMissing roleLabel="Influencer / Content Creator" registerHref="/register/influencer" />;
  }

  if (load.kind !== "ok" || !data) {
    return (
      <Notice tone="error" title="We could not load your brand kit">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const { inf, approved, promoCode } = data;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Subpage Header with Navigation Tabs */}
      <InfluencerSubpageHeader
        title="Official Brand Kit & Community Promo Code"
        description="Access official high-resolution vector logos, broadcast color codes, 4K drone B-Roll footage, and your exclusive 10% community discount code."
        creatorName={inf.fullName}
        stageName={inf.stageName}
        primaryPlatform={inf.primaryPlatform}
        followerCount={inf.followerCount}
        approved={approved}
        activeHref="/dashboard/influencer/brand-kit"
      />

      {/* Main Interactive Brand Kit Hub */}
      <BrandKitHub
        promoCode={promoCode}
        creatorHandle={inf.stageName || inf.fullName}
      />
    </div>
  );
}
