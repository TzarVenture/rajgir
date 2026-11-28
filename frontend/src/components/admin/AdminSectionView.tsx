"use client";

import { Notice } from "@/components/ui";
import type { AdminSectionData } from "@/lib/admin/sectionData";
import { AdminActionProvider } from "@/components/admin/shared";
import { AnalyticsSection, DashboardSection, ReportsSection, RevenueSection } from "@/components/admin/sections/overview";
import { RegistrationsSection } from "@/components/admin/sections/registrations";
import { LiveRaceSection, VolunteersSection } from "@/components/admin/sections/operations";
import { ApprovalsSection, InfluencersSection, PartnerSection } from "@/components/admin/sections/partners";
import { CmsSection, MediaSection, NotificationsSection, SupportSection } from "@/components/admin/sections/content";
import {
  AuditLogSection,
  EventsSection,
  PaymentsSection,
  PermissionsSection,
  RolesSection,
  SettingsSection,
  UsersSection,
} from "@/components/admin/sections/platform";

/** One admin console page: heading, load problems, action messages, then the section itself. */
export function AdminSectionView({
  slug,
  title,
  description,
  data,
  failed,
  currentUserId,
}: {
  slug: string;
  title: string;
  description: string;
  data: AdminSectionData;
  failed: string[];
  currentUserId: string;
}) {
  return (
    <div className="space-y-6">
      <header className="border-b border-charcoal-200 pb-4">
        <h1 className="font-barlow text-2xl font-bold text-charcoal-900 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-charcoal-600">{description}</p> : null}
      </header>

      {failed.length ? (
        <Notice tone="error" title="Some data could not be loaded">
          Could not load {failed.join(", ")}. What is shown below may be incomplete. Refresh the page to try again.
        </Notice>
      ) : null}

      <AdminActionProvider>
        <Section slug={slug} data={data} currentUserId={currentUserId} />
      </AdminActionProvider>
    </div>
  );
}

function Section({ slug, data, currentUserId }: { slug: string; data: AdminSectionData; currentUserId: string }) {
  switch (slug) {
    case "dashboard":
      return <DashboardSection overview={data.overview} runners={data.runners} />;
    case "revenue":
      return <RevenueSection overview={data.overview} runners={data.runners} />;
    case "analytics":
      return <AnalyticsSection overview={data.overview} />;
    case "reports":
      return <ReportsSection overview={data.overview} runners={data.runners} />;
    case "registrations":
    case "todays-registrations":
    case "check-ins":
      return <RegistrationsSection slug={slug} runners={data.runners} total={data.runnersTotal} />;
    case "live-race":
      return <LiveRaceSection incidents={data.incidents} />;
    case "volunteers":
      return <VolunteersSection volunteers={data.volunteers} />;
    case "approvals":
      return <ApprovalsSection appeals={data.appeals} applications={data.applications} />;
    case "sponsors":
    case "vendors":
    case "hotels":
    case "tourism":
    case "schools":
    case "corporates":
      return <PartnerSection slug={slug} applications={data.applications} appeals={data.appeals} />;
    case "influencers":
      return <InfluencersSection influencers={data.influencers} />;
    case "events":
      return <EventsSection events={data.events} />;
    case "payments":
      return <PaymentsSection payments={data.payments} />;
    case "media":
      return <MediaSection media={data.media} />;
    case "cms":
      return <CmsSection cms={data.cms} />;
    case "notifications":
      return <NotificationsSection notifications={data.notifications} />;
    case "support":
      return <SupportSection support={data.support} />;
    case "users":
      return <UsersSection users={data.users} currentUserId={currentUserId} />;
    case "roles":
      return <RolesSection users={data.users} />;
    case "permissions":
      return <PermissionsSection permissions={data.permissions} />;
    case "audit-logs":
      return <AuditLogSection auditLogs={data.auditLogs} />;
    case "settings":
      return <SettingsSection settings={data.settings} />;
    default:
      return <Notice tone="warning">This section is not available.</Notice>;
  }
}
