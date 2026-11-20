import React from "react";
import Link from "next/link";
import {
  LuArrowLeft,
  LuBookOpen,
  LuCircleCheck,
  LuClipboardCheck,
  LuClipboardList,
  LuClock,
  LuIdCard,
  LuLayoutDashboard,
  LuLifeBuoy,
  LuShieldAlert,
  LuUserRound,
} from "react-icons/lu";
import { Badge, cn } from "@/components/ui";
import { DUTY_LABELS } from "@/lib/volunteerDashboard";

interface VolunteerSubpageHeaderProps {
  title: string;
  description: string;
  role: string;
  station: string | null;
  sector: string | null;
  sectorColor: string;
  duty: string;
  approved: boolean;
  activeHref?: string;
}

const NAV_TABS = [
  { href: "/dashboard/volunteer", label: "Overview", icon: LuLayoutDashboard },
  { href: "/dashboard/volunteer/shift", label: "Duty & Shift", icon: LuClock },
  { href: "/dashboard/volunteer/badge", label: "Accreditation Pass", icon: LuIdCard },
  { href: "/dashboard/volunteer/checklist", label: "Station Checklist", icon: LuClipboardCheck },
  { href: "/dashboard/volunteer/incidents", label: "Incident Desk", icon: LuShieldAlert },
  { href: "/dashboard/volunteer/sop", label: "Field SOPs", icon: LuBookOpen },
  { href: "/dashboard/volunteer/application", label: "My Application", icon: LuClipboardList },
  { href: "/dashboard/volunteer/profile", label: "Profile & Account", icon: LuUserRound },
  { href: "/dashboard/volunteer/support", label: "Helpdesk", icon: LuLifeBuoy },
];

export function VolunteerSubpageHeader({
  title,
  description,
  role,
  station,
  sector,
  sectorColor,
  duty,
  approved,
  activeHref,
}: VolunteerSubpageHeaderProps) {
  return (
    <div className="space-y-4 rounded-card border border-charcoal-200 bg-white p-5 sm:p-6 shadow-2xs">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal-100 pb-3">
        <Link
          href="/dashboard/volunteer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-brand-red transition-colors"
        >
          <LuArrowLeft className="h-4 w-4" />
          <span>Back to Volunteer Hub</span>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {approved ? (
            <Badge tone="success">
              <LuCircleCheck className="h-3 w-3" aria-hidden /> Approved
            </Badge>
          ) : (
            <Badge tone="warning">Under Review</Badge>
          )}
          <Badge tone="brand">{role}</Badge>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
              duty === "ON_DUTY"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : duty === "ON_BREAK"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-charcoal-100 text-charcoal-700 border border-charcoal-200"
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                duty === "ON_DUTY"
                  ? "bg-emerald-500 animate-pulse"
                  : duty === "ON_BREAK"
                    ? "bg-amber-500"
                    : "bg-charcoal-400"
              )}
            />
            {DUTY_LABELS[duty] ?? duty}
          </span>
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
        {station ? (
          <div className="flex items-center gap-2 rounded-btn bg-surface-soft px-3 py-1.5 border border-charcoal-200 text-xs font-medium text-charcoal-700 self-start sm:self-auto shrink-0">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sectorColor }} />
            <span>Station: <strong>{station}</strong></span>
            {sector ? <span className="text-charcoal-400">|</span> : null}
            {sector ? <span>Sector <strong>{sector}</strong></span> : null}
          </div>
        ) : null}
      </div>

      {/* Section Quick Tabs */}
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
