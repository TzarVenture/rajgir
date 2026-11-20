import React from "react";
import Link from "next/link";
import {
  LuBadgeCheck,
  LuCamera,
  LuCheck,
  LuCircleAlert,
  LuCircleCheck,
  LuCompass,
  LuIdCard,
  LuMapPin,
  LuRadio,
  LuShieldAlert,
  LuVideo,
} from "react-icons/lu";
import { getInfluencerDashboardContext } from "@/lib/influencerDashboard";
import { RegistrationMissing } from "@/components/dashboard/ActionItems";
import { Badge, Notice } from "@/components/ui";
import { SectionCard } from "@/components/dashboard/DashboardParts";
import { InfluencerSubpageHeader } from "@/components/dashboard/influencer/InfluencerSubpageHeader";
import { MediaPassCard } from "@/components/dashboard/influencer/MediaPassCard";
import { EVENT } from "@/lib/event";

export const metadata = {
  title: "Media Pass & VIP Press Accreditation | Rajgir Marathon 2027",
};

export default async function InfluencerMediaPassPage() {
  const { load, data } = await getInfluencerDashboardContext("/dashboard/influencer/pass");

  if (load.kind === "not-registered") {
    return <RegistrationMissing roleLabel="Influencer / Content Creator" registerHref="/register/influencer" />;
  }

  if (load.kind !== "ok" || !data) {
    return (
      <Notice tone="error" title="We could not load your media pass">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const { inf, approved, creatorId, promoCode, mediaPassNumber, badgeQr } = data;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Subpage Header with Navigation Tabs */}
      <InfluencerSubpageHeader
        title="Official Media Pass & VIP Accreditation"
        description="Your verified press credential for race day filming zones, media lounge entry, elevated photo platforms, and athlete mixed zones."
        creatorName={inf.fullName}
        stageName={inf.stageName}
        primaryPlatform={inf.primaryPlatform}
        followerCount={inf.followerCount}
        approved={approved}
        activeHref="/dashboard/influencer/pass"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column (5 cols): Printable / Digital Media Pass */}
        <div className="lg:col-span-5 space-y-4">
          <SectionCard
            title="Digital Press Credential"
            description="Present this QR code at the RICC Press Desk to collect your official high-visibility lanyard."
            tag={<Badge tone="brand">Official Pass</Badge>}
          >
            <MediaPassCard
              creatorName={inf.fullName}
              stageName={inf.stageName}
              platform={inf.primaryPlatform}
              creatorId={creatorId}
              mediaPassNumber={mediaPassNumber}
              badgeQr={badgeQr}
              approved={approved}
            />
          </SectionCard>
        </div>

        {/* Right Column (7 cols): Authorized Access Zones & Equipment Protocols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Authorized Press Zones */}
          <SectionCard
            title="Authorized Media Zones & Clearances"
            description="Your accreditation tier grants physical access to the following secured event zones on race day."
            tag={<Badge tone="success">VIP All-Access</Badge>}
          >
            <div className="space-y-3.5">
              {[
                {
                  zone: "Zone 1: Finish Line Elevated Photo Gantry",
                  desc: "Elevated camera staging platform 15 meters after the timing mats. Clear direct sightlines for runner finish smiles and podium arrivals.",
                  timing: "Open 05:30 AM – 12:30 PM",
                },
                {
                  zone: "Zone 2: Start Arena VIP Media Pen",
                  desc: "Positioned directly adjacent to the elite corral gun line. Ideal for countdown reels, runner crowd energy, and VIP flag-off shots.",
                  timing: "Open 04:30 AM – 06:15 AM",
                },
                {
                  zone: "Zone 3: Mixed Interview Zone & Media Lounge",
                  desc: "Air-conditioned work lounge with dedicated high-speed Wi-Fi, battery charging stations, live checkpoint feeds, and athlete interview backdrop.",
                  timing: "Open 05:00 AM – 04:00 PM",
                },
                {
                  zone: "Zone 4: Lead Media Truck (Reservation Required)",
                  desc: "Slow-speed electric media vehicle driving ahead of the Full Marathon lead pack. Requires pre-booking via PR helpdesk.",
                  timing: "Departs 04:45 AM Sharp",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-btn border border-charcoal-200 bg-surface-soft p-3.5 flex items-start gap-3"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-red-light text-brand-red font-bold text-xs">
                    ✓
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-xs sm:text-sm text-charcoal-900">{item.zone}</p>
                    <p className="text-xs text-charcoal-600 leading-relaxed">{item.desc}</p>
                    <p className="text-[11px] font-mono text-brand-red font-semibold pt-1">{item.timing}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Equipment Clearance & Safety Guidelines */}
          <SectionCard
            title="Camera Gear & Drone Operation Protocols"
            tag={<Badge tone="neutral">Safety Guidelines</Badge>}
          >
            <div className="space-y-3 text-xs sm:text-sm text-charcoal-700">
              <div className="rounded-btn border border-charcoal-200 bg-white p-3 space-y-1">
                <p className="font-semibold text-charcoal-900 flex items-center gap-1.5">
                  <LuCamera className="h-4 w-4 text-brand-red" />
                  <span>Handheld Rigs & Gimbals (Pre-Approved)</span>
                </p>
                <p className="text-xs text-charcoal-600">
                  Smartphones, mirrorless cameras, action cams, and handheld gimbals are permitted in all designated media zones without special paperwork.
                </p>
              </div>

              <div className="rounded-btn border border-charcoal-200 bg-white p-3 space-y-1">
                <p className="font-semibold text-charcoal-900 flex items-center gap-1.5">
                  <LuRadio className="h-4 w-4 text-brand-red" />
                  <span>Drones & Heavy Cinema Rigs (Clearance Required)</span>
                </p>
                <p className="text-xs text-charcoal-600">
                  Unmanned Aerial Vehicles (UAVs) require DGCA pilot registration and local administration approval. Do not hover directly above crowded starting corrals.
                </p>
              </div>

              <Notice tone="info" title="Course Etiquette Reminder">
                Never cross directly in front of runners or obstruct hydration stations. A minimum 2-meter buffer must be maintained from running athletes at all times.
              </Notice>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
