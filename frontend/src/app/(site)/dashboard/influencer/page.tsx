import React from "react";
import Link from "next/link";
import {
  LuArrowRight,
  LuArrowUpRight,
  LuAward,
  LuCalendar,
  LuCamera,
  LuCircleCheck,
  LuClipboardCheck,
  LuEye,
  LuIdCard,
  LuMegaphone,
  LuPhone,
  LuShare2,
  LuSparkles,
  LuUserRound,
  LuVideo,
} from "react-icons/lu";
import { getInfluencerDashboardContext } from "@/lib/influencerDashboard";
import { ActionItems, RegistrationMissing } from "@/components/dashboard/ActionItems";
import { Badge, Card, Notice } from "@/components/ui";
import { DetailList, SectionCard } from "@/components/dashboard/DashboardParts";
import { EVENT, formatDate, formatDateTime } from "@/lib/event";

export const metadata = {
  title: "Influencer & Media Creator Dashboard | Rajgir Marathon 2027",
};

function ProfileTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex min-w-0 flex-col justify-between rounded-card border border-charcoal-200 bg-white p-4 shadow-2xs transition-all hover:border-charcoal-300">
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">{label}</p>
          {Icon ? <Icon className="h-4 w-4 text-charcoal-400" /> : null}
        </div>
        <div className="mt-1.5 font-barlow text-2xl font-bold leading-tight text-charcoal-900 break-words">
          {value}
        </div>
      </div>
      {hint ? (
        <div className="mt-2.5 text-xs text-charcoal-600 leading-normal break-words border-t border-charcoal-100 pt-2">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

export default async function InfluencerDashboard() {
  const { load, data } = await getInfluencerDashboardContext("/dashboard/influencer");

  if (load.kind === "not-registered") {
    return (
      <RegistrationMissing
        roleLabel="Influencer / Content Creator"
        registerHref="/register/influencer"
      />
    );
  }

  if (load.kind !== "ok" || !data) {
    return (
      <Notice tone="error" title="We could not load your influencer dashboard">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const {
    inf,
    approved,
    rejected,
    creatorId,
    promoCode,
    mediaPassNumber,
    initials,
    brand,
    todo,
    deliverablesList,
  } = data;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ---------- Executive Hero Card & Quick Action Hub ---------- */}
      <Card padded={false} className="overflow-hidden">
        <div className="h-2.5 bg-brand-red" aria-hidden />
        <div className="p-5 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Identity & Status */}
            <div className="flex items-start gap-4 sm:gap-5">
              <div
                className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl text-xl sm:text-2xl font-bold text-white shadow-md"
                style={{ backgroundColor: brand.accent }}
              >
                {initials}
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-charcoal-500">
                    {creatorId}
                  </span>
                  {approved ? (
                    <Badge tone="success">
                      <LuCircleCheck className="h-3 w-3" aria-hidden /> Approved Media Partner
                    </Badge>
                  ) : rejected ? (
                    <Badge tone="error">Proposal Declined</Badge>
                  ) : (
                    <Badge tone="warning">Under Media Review</Badge>
                  )}
                  <span className="rounded-full bg-surface-soft border border-charcoal-200 px-2.5 py-0.5 text-xs font-semibold text-charcoal-700">
                    {inf.primaryPlatform} • {inf.followerCount}
                  </span>
                </div>

                <h1 className="font-barlow text-2xl sm:text-3xl lg:text-4xl font-bold text-charcoal-900 leading-tight">
                  {inf.fullName}
                </h1>

                <p className="text-xs sm:text-sm text-charcoal-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {inf.stageName ? <span className="font-mono font-semibold text-brand-red">{inf.stageName}</span> : null}
                  <span>{inf.targetNiche}</span>
                  <span>•</span>
                  <span>{inf.city || "Patna"}, {inf.country || "India"}</span>
                </p>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-2 border-t border-charcoal-100 pt-4 lg:border-t-0 lg:pt-0">
              <Link
                href="/dashboard/influencer/pass"
                className="inline-flex min-h-11 items-center gap-2 rounded-btn bg-brand-red px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xs hover:bg-brand-red-dark transition-colors"
              >
                <LuIdCard className="h-4 w-4" />
                <span>Media Pass</span>
              </Link>

              <Link
                href="/dashboard/influencer/brand-kit"
                className="inline-flex min-h-11 items-center gap-2 rounded-btn border border-charcoal-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-charcoal-700 hover:bg-charcoal-100 transition-colors"
              >
                <LuSparkles className="h-4 w-4 text-brand-red" />
                <span>Brand Kit & Promo</span>
              </Link>

              <Link
                href="/dashboard/influencer/deliverables"
                className="inline-flex min-h-11 items-center gap-2 rounded-btn border border-charcoal-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-charcoal-700 hover:bg-charcoal-100 transition-colors"
              >
                <LuClipboardCheck className="h-4 w-4" />
                <span>Deliverables</span>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* ---------- 4-Tile Creator Metrics Grid ---------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ProfileTile
          label="Primary Channel"
          value={inf.primaryPlatform}
          icon={LuMegaphone}
          hint={
            <span className="font-mono text-xs text-charcoal-700 truncate block">
              {inf.profileUrl.replace(/^https?:\/\/(www\.)?/, "")}
            </span>
          }
        />
        <ProfileTile
          label="Audience Reach"
          value={inf.followerCount}
          icon={LuEye}
          hint={
            <span>
              Engagement Rate: <strong>{inf.engagementRate || "4.5%"}</strong>
            </span>
          }
        />
        <ProfileTile
          label="Media Pass Number"
          value={
            <span className="font-mono text-lg sm:text-xl text-brand-red">
              {mediaPassNumber}
            </span>
          }
          icon={LuIdCard}
          hint={
            <span>
              Status: <strong>{approved ? "VIP All-Access" : "Pending Clearance"}</strong>
            </span>
          }
        />
        <ProfileTile
          label="Promo Discount Code"
          value={
            <span className="font-mono text-lg sm:text-xl text-brand-red">
              {promoCode}
            </span>
          }
          icon={LuShare2}
          hint={
            <span>
              Offers <strong>10% OFF</strong> for your community
            </span>
          }
        />
      </div>

      {/* ---------- Two Column Section: Action Items + Campaign Snapshot ---------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column (7 cols): Action Items To-Do */}
        <div className="space-y-6 lg:col-span-7">
          <SectionCard
            title="Creator Milestones & Action Checklist"
            description="Complete these campaign steps leading up to race weekend in Rajgir."
            tag={<Badge tone="brand">Road to Race Day</Badge>}
          >
            <ActionItems items={todo} />
          </SectionCard>

          {/* Campaign Deliverables Snapshot */}
          <SectionCard
            title="Agreed Campaign Deliverables"
            description="Track your video and reel submissions for the Rajgir Marathon 2027 campaign."
            tag={
              <Link
                href="/dashboard/influencer/deliverables"
                className="text-xs font-semibold text-brand-red hover:underline flex items-center gap-1"
              >
                <span>Full Deliverables Hub</span>
                <LuArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <div className="space-y-3">
              {deliverablesList.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-btn border border-charcoal-200 bg-surface-soft p-3.5 flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-charcoal-500">
                        #{idx + 1}
                      </span>
                      <p className="font-semibold text-xs sm:text-sm text-charcoal-900">
                        {item.title}
                      </p>
                    </div>
                    <p className="text-xs text-charcoal-500">{item.window} • {item.platform}</p>
                  </div>
                  <Badge tone={item.status === "COMPLETED" ? "success" : "neutral"}>
                    {item.status === "COMPLETED" ? "Cleared" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Right Column (5 cols): Race Weekend Schedule + PR Hotline */}
        <div className="space-y-6 lg:col-span-5">
          {/* Race Weekend Media Schedule */}
          <SectionCard
            title="Race Weekend Media Itinerary"
            tag={<Badge tone="info">Media Center</Badge>}
          >
            <div className="space-y-3.5 text-xs sm:text-sm text-charcoal-700">
              <div className="rounded-btn border border-charcoal-200 bg-surface-soft p-3 space-y-1">
                <span className="font-mono text-[11px] font-bold text-brand-red block">
                  FRIDAY — EXPO DAY 1 (10:00 AM – 06:00 PM)
                </span>
                <p className="font-semibold text-charcoal-900">Media Badge Pickup & Lounge Access</p>
                <p className="text-xs text-charcoal-600">
                  Collect press lanyards, vehicle passes, and camera tags at RICC Press Desk.
                </p>
              </div>

              <div className="rounded-btn border border-charcoal-200 bg-surface-soft p-3 space-y-1">
                <span className="font-mono text-[11px] font-bold text-brand-red block">
                  SATURDAY — RACE EVE (03:00 PM – 05:00 PM)
                </span>
                <p className="font-semibold text-charcoal-900">Official Media Briefing & Press Conf</p>
                <p className="text-xs text-charcoal-600">
                  Briefing with race director, route safety briefing, and elite athlete photo call.
                </p>
              </div>

              <div className="rounded-btn border border-charcoal-200 bg-surface-soft p-3 space-y-1">
                <span className="font-mono text-[11px] font-bold text-brand-red block">
                  SUNDAY — RACE MORNING (04:15 AM – 12:00 PM)
                </span>
                <p className="font-semibold text-charcoal-900">Start Corral Gun Time & Finish Gantry</p>
                <p className="text-xs text-charcoal-600">
                  Elevated photo platform access, live story broadcast zone, and post-race podium.
                </p>
              </div>
            </div>
          </SectionCard>

          {/* PR Liaison Helplines */}
          <SectionCard
            title="PR & Media Liaison Contacts"
            tag={<Badge tone="brand">Press Desk</Badge>}
          >
            <div className="space-y-3 text-xs sm:text-sm text-charcoal-700">
              <div className="rounded-btn border border-charcoal-200 bg-surface-soft p-3 space-y-1">
                <p className="font-semibold text-charcoal-900">Official Media Liaison</p>
                <p className="font-mono text-xs text-brand-red">+91 94310 12345 / +91 94310 67890</p>
                <p className="text-[11px] text-charcoal-500">Available 08:00 AM – 08:00 PM IST</p>
              </div>

              <div className="rounded-btn border border-charcoal-200 bg-surface-soft p-3 space-y-1">
                <p className="font-semibold text-charcoal-900">Press & Partnerships Email</p>
                <p className="font-mono text-xs text-charcoal-800">{EVENT.contacts.helpEmail}</p>
                <p className="text-[11px] text-charcoal-500">Monitored continuously for creator support</p>
              </div>

              <Notice tone="info" title="Filming Permits">
                Operating high-altitude drones requires official district administration security tags issued during Saturday&apos;s media briefing.
              </Notice>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
