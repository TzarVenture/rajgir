import React from "react";
import Link from "next/link";
import {
  LuArrowLeft,
  LuBadgeCheck,
  LuCircleAlert,
  LuLifeBuoy,
  LuMail,
  LuMapPin,
  LuMegaphone,
  LuPhoneCall,
  LuRadio,
  LuShieldAlert,
  LuTicket,
  LuUserCheck,
} from "react-icons/lu";
import { getInfluencerDashboardContext } from "@/lib/influencerDashboard";
import { RegistrationMissing } from "@/components/dashboard/ActionItems";
import { Badge, Notice } from "@/components/ui";
import { SectionCard } from "@/components/dashboard/DashboardParts";
import { InfluencerSubpageHeader } from "@/components/dashboard/influencer/InfluencerSubpageHeader";
import { SupportFaqAccordion } from "@/components/dashboard/support/SupportFaqAccordion";
import { SupportTicketForm } from "@/components/dashboard/support/SupportTicketForm";
import {
  INFLUENCER_CATEGORIES,
  INFLUENCER_FAQS,
  INFLUENCER_SUPPORT_TOPICS,
} from "@/lib/supportData";
import { EVENT } from "@/lib/event";

export const metadata = {
  title: "PR & Media Creator Helpdesk | Rajgir Marathon 2027",
};

export default async function InfluencerSupportPage() {
  const { load, data } = await getInfluencerDashboardContext("/dashboard/influencer/support");

  if (load.kind === "not-registered") {
    return <RegistrationMissing roleLabel="Influencer / Content Creator" registerHref="/register/influencer" />;
  }

  if (load.kind !== "ok" || !data) {
    return (
      <Notice tone="error" title="We could not load your PR helpdesk">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const { inf, approved, creatorId, promoCode, mediaPassNumber } = data;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Subpage Header with Navigation Tabs */}
      <InfluencerSubpageHeader
        title="PR &amp; Media Creator Helpdesk"
        description="Dedicated liaison desk for press inquiries, drone permits, filming zone passes, elite runner interview requests, and deliverables support."
        creatorName={inf.fullName}
        stageName={inf.stageName}
        primaryPlatform={inf.primaryPlatform}
        followerCount={inf.followerCount}
        approved={approved}
        activeHref="/dashboard/influencer/support"
      />

      {/* Creator Context Summary Card */}
      <div className="rounded-card border border-charcoal-200 bg-white p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-100 pb-3">
          <div>
            <span className="text-xs font-semibold text-charcoal-500">Authenticated Media Partner</span>
            <h2 className="font-barlow text-lg font-bold text-charcoal-900">
              {inf.fullName} {inf.stageName ? `(${inf.stageName})` : ""}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-red-light px-3 py-1 font-mono text-xs font-bold text-brand-red-dark">
              {creatorId}
            </span>
            <span className="rounded-full bg-charcoal-100 px-3 py-1 text-xs font-semibold text-charcoal-700">
              Pass #{mediaPassNumber}
            </span>
            <Badge tone={approved ? "success" : "warning"}>
              {approved ? "Accredited Media" : "Under Review"}
            </Badge>
          </div>
        </div>

        <p className="mt-3 text-xs text-charcoal-600">
          Your active creator profile, audience reach, and accreditation number are automatically linked to every support ticket submitted below for prompt response from our PR directors.
        </p>
      </div>

      {/* Main Two-Column Layout: FAQs + Ticket Submission & Helplines */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column (7 cols): Knowledge Base & FAQs */}
        <div className="space-y-6 lg:col-span-7">
          <SectionCard
            title="Press Knowledge Base & Media FAQs"
            description="Quick answers regarding filming rights, drone permits, finish-line passes, athlete interviews, and media lounge amenities."
            tag={<Badge tone="neutral">Searchable Guide</Badge>}
          >
            <SupportFaqAccordion
              faqs={INFLUENCER_FAQS}
              categories={INFLUENCER_CATEGORIES}
              searchPlaceholder="Search media topics (e.g. drone permit, VIP photo gantry, athlete interview, promo code)..."
            />
          </SectionCard>
        </div>

        {/* Right Column (5 cols): Ticket Form & Helpline Contacts */}
        <div className="space-y-6 lg:col-span-5">
          <SectionCard
            title="Submit a Direct PR Inquiry"
            description="Have a question that is not answered in the FAQ? Send a ticket directly to the Rajgir Marathon PR and media committee."
            tag={<Badge tone="brand">Direct Press Desk</Badge>}
          >
            <SupportTicketForm
              context={{
                athleteName: inf.fullName,
                email: inf.email,
                phone: inf.phone,
                registrationNumber: creatorId,
                roleLabel: `${inf.primaryPlatform} Creator`,
              }}
              topics={INFLUENCER_SUPPORT_TOPICS}
            />
          </SectionCard>

          {/* Official PR Helplines & Expo Media Lounge */}
          <SectionCard
            title="Official Media Contacts & Press Lounge"
            tag={<Badge tone="info">Press Relations</Badge>}
          >
            <div className="space-y-4 text-xs sm:text-sm text-charcoal-700">
              <div className="flex items-start gap-3 rounded-btn border border-charcoal-200 bg-surface-soft p-3">
                <LuMail className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" aria-hidden />
                <div>
                  <p className="font-semibold text-charcoal-900">PR &amp; Media Coordination Email</p>
                  <p className="text-charcoal-600 mt-0.5 font-mono text-xs">{EVENT.contacts.helpEmail}</p>
                  <p className="text-[11px] text-charcoal-500 mt-1">Direct desk for media clearance &amp; press releases</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-btn border border-charcoal-200 bg-surface-soft p-3">
                <LuPhoneCall className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" aria-hidden />
                <div>
                  <p className="font-semibold text-charcoal-900">Media Liaison Hotlines</p>
                  <p className="text-charcoal-600 mt-0.5 font-mono text-xs">+91 94310 12345 / +91 94310 67890</p>
                  <p className="text-[11px] text-charcoal-500 mt-1">Available 08:00 AM – 08:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-btn border border-charcoal-200 bg-surface-soft p-3">
                <LuMapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" aria-hidden />
                <div>
                  <p className="font-semibold text-charcoal-900">Race Day Media Lounge (In-Person)</p>
                  <p className="text-charcoal-600 mt-0.5">RICC Main Stadium, Media Center (Hall B)</p>
                  <p className="text-[11px] text-charcoal-500 mt-1">
                    Equipped with high-speed Wi-Fi, camera charging stations, and hot refreshments.
                  </p>
                </div>
              </div>

              <Notice tone="info" title="Elite Interview Scheduling">
                All 1-on-1 athlete interview requests for race eve and finish line mixed zone must be submitted at least 48 hours prior to race morning.
              </Notice>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
