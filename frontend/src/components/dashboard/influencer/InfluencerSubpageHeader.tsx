import React from "react";
import Link from "next/link";
import {
  LuArrowLeft,
  LuCircleCheck,
  LuClipboardCheck,
  LuClipboardList,
  LuIdCard,
  LuLayoutDashboard,
  LuLifeBuoy,
  LuMegaphone,
  LuSparkles,
  LuUserRound,
} from "react-icons/lu";
import { Badge, cn } from "@/components/ui";

interface InfluencerSubpageHeaderProps {
  title: string;
  description: string;
  creatorName: string;
  stageName: string | null;
  primaryPlatform: string;
  followerCount: string;
  approved: boolean;
  activeHref?: string;
}

const NAV_TABS = [
  { href: "/dashboard/influencer", label: "Overview Hub", icon: LuLayoutDashboard },
  { href: "/dashboard/influencer/pass", label: "Media Accreditation Pass", icon: LuIdCard },
  { href: "/dashboard/influencer/deliverables", label: "Campaign Deliverables", icon: LuClipboardCheck },
  { href: "/dashboard/influencer/brand-kit", label: "Brand Kit & Promo", icon: LuSparkles },
  { href: "/dashboard/influencer/application", label: "My Proposal", icon: LuClipboardList },
  { href: "/dashboard/influencer/profile", label: "Profile & Account", icon: LuUserRound },
  { href: "/dashboard/influencer/support", label: "PR Helpdesk", icon: LuLifeBuoy },
];

export function InfluencerSubpageHeader({
  title,
  description,
  creatorName,
  stageName,
  primaryPlatform,
  followerCount,
  approved,
  activeHref,
}: InfluencerSubpageHeaderProps) {
  return (
    <div className="space-y-4 rounded-card border border-charcoal-200 bg-white p-5 sm:p-6 shadow-2xs">
      {/* Breadcrumb & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal-100 pb-3">
        <Link
          href="/dashboard/influencer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-brand-red transition-colors"
        >
          <LuArrowLeft className="h-4 w-4" />
          <span>Back to Influencer Hub</span>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {approved ? (
            <Badge tone="success">
              <LuCircleCheck className="h-3 w-3" aria-hidden /> Approved Media Partner
            </Badge>
          ) : (
            <Badge tone="warning">Under Review</Badge>
          )}
          <Badge tone="brand">
            <LuMegaphone className="h-3 w-3" aria-hidden />
            {primaryPlatform} • {followerCount}
          </Badge>
        </div>
      </div>

      {/* Main Title Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-barlow text-2xl sm:text-3xl font-bold text-charcoal-900 leading-tight">
            {title}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-charcoal-600">{description}</p>
        </div>
        {stageName ? (
          <div className="flex items-center gap-2 rounded-btn bg-surface-soft px-3 py-1.5 border border-charcoal-200 text-xs font-mono font-bold text-charcoal-700 self-start sm:self-auto shrink-0">
            <span>{stageName}</span>
          </div>
        ) : null}
      </div>

      {/* Quick Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeHref === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-btn px-3 py-1.5 text-xs font-semibold transition-colors",
                isActive
                  ? "bg-brand-red text-white shadow-2xs"
                  : "text-charcoal-600 hover:bg-charcoal-100 hover:text-charcoal-900"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
