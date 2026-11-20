import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LuArrowLeft,
  LuClock,
  LuCircleHelp,
  LuLifeBuoy,
  LuMail,
  LuMapPin,
  LuPhoneCall,
  LuShieldAlert,
  LuTicket,
} from "react-icons/lu";
import type { ApiRunnerRegistration } from "@/lib/api";
import { loadRunnerDashboard } from "@/lib/dashboardData";
import { RegistrationMissing } from "@/components/dashboard/ActionItems";
import { authContext, requireUser } from "@/lib/auth/session";
import { EVENT, formatDate } from "@/lib/event";
import { Badge, Notice } from "@/components/ui";
import { DetailList, SectionCard } from "@/components/dashboard/DashboardParts";
import { SupportFaqAccordion } from "@/components/dashboard/support/SupportFaqAccordion";
import { SupportTicketForm } from "@/components/dashboard/support/SupportTicketForm";

export const metadata = {
  title: "Support & Helpdesk | Rajgir Marathon 2027",
};

export default async function RunnerSupportPage() {
  const user = await requireUser("/dashboard/runner/support");
  if (user.role !== "RUNNER") redirect("/dashboard");

  const ctx = await authContext();
  const load = ctx
    ? await loadRunnerDashboard(ctx)
    : ({ kind: "error", message: "Your session has expired. Please sign in again." } as const);

  if (load.kind === "not-registered") return <RegistrationMissing roleLabel="Runner" registerHref="/register/runner" />;
  if (load.kind !== "ok") {
    return (
      <Notice tone="error" title="We could not load your support desk">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const r: ApiRunnerRegistration = load.data;
  const fullName = `${r.firstName} ${r.lastName}`.trim();

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-charcoal-200 pb-5">
        <div>
          <Link
            href="/dashboard/runner"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-brand-red transition-colors mb-2"
          >
            <LuArrowLeft className="h-3.5 w-3.5" aria-hidden />
            <span>Back to Overview Hub</span>
          </Link>
          <h1 className="font-barlow text-2xl sm:text-3xl font-bold text-charcoal-900 flex items-center gap-2.5">
            <LuLifeBuoy className="h-7 w-7 text-brand-red" aria-hidden />
            <span>Runner Support & Race Helpdesk</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-charcoal-600">
            Dedicated participant support desk. Instant answers, direct ticket routing to race directors, and emergency helplines.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{r.distance} {r.raceTitle}</Badge>
          <Badge tone="info">
            <LuTicket className="h-3.5 w-3.5" aria-hidden /> Priority Participant Desk
          </Badge>
        </div>
      </div>

      {/* Runner Context Summary Card */}
      <div className="rounded-card border border-charcoal-200 bg-white p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-100 pb-3">
          <div>
            <span className="text-xs font-semibold text-charcoal-500">Authenticated Athlete Identity</span>
            <h2 className="font-barlow text-lg font-bold text-charcoal-900">{fullName}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-red-light px-3 py-1 font-mono text-xs font-bold text-brand-red-dark">
              Reg #{r.registrationNumber}
            </span>
            <span className="rounded-full bg-charcoal-100 px-3 py-1 text-xs font-semibold text-charcoal-700">
              {r.bibNumber ? `Bib #${r.bibNumber}` : "Bib Pending"}
            </span>
          </div>
        </div>

        <p className="mt-3 text-xs text-charcoal-600">
          Your active runner registration details are automatically linked whenever you submit an inquiry, ensuring faster resolution without redundant back-and-forth emails.
        </p>
      </div>

      {/* Main Two-Column Layout: FAQs + Ticket Submission & Helplines */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column (7 cols): Knowledge Base & FAQs */}
        <div className="space-y-6 lg:col-span-7">
          <SectionCard
            title="Knowledge Base & Frequently Asked Questions"
            description="Quick answers for bib collection, proxy authorization, RFID timing, and race logistics."
            tag={<Badge tone="neutral">Searchable Guide</Badge>}
          >
            <SupportFaqAccordion />
          </SectionCard>
        </div>

        {/* Right Column (5 cols): Ticket Form & Helpline Contacts */}
        <div className="space-y-6 lg:col-span-5">
          <SectionCard
            title="Submit a Direct Support Ticket"
            description="Have a question that is not answered in the FAQ? Send a ticket directly to race operations."
            tag={<Badge tone="brand">Direct Helpdesk</Badge>}
          >
            <SupportTicketForm
              context={{
                athleteName: fullName,
                email: r.email,
                phone: r.phone,
                registrationNumber: r.registrationNumber,
                distance: r.distance,
              }}
            />
          </SectionCard>

          {/* Official Helplines & Expo Assistance */}
          <SectionCard
            title="Direct Contact & Expo Assistance"
            tag={<Badge tone="info">Race Operations</Badge>}
          >
            <div className="space-y-4 text-xs sm:text-sm text-charcoal-700">
              <div className="flex items-start gap-3 rounded-btn border border-charcoal-200 bg-surface-soft p-3">
                <LuMail className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" aria-hidden />
                <div>
                  <p className="font-semibold text-charcoal-900">Official Helpdesk Email</p>
                  <p className="text-charcoal-600 mt-0.5 font-mono text-xs">{EVENT.contacts.helpEmail}</p>
                  <p className="text-[11px] text-charcoal-500 mt-1">Monitored daily (24 hr SLA)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-btn border border-charcoal-200 bg-surface-soft p-3">
                <LuPhoneCall className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" aria-hidden />
                <div>
                  <p className="font-semibold text-charcoal-900">Race Control Helplines</p>
                  <p className="text-charcoal-600 mt-0.5 font-mono text-xs">+91 94310 12345 / +91 94310 67890</p>
                  <p className="text-[11px] text-charcoal-500 mt-1">Available 09:00 AM – 06:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-btn border border-charcoal-200 bg-surface-soft p-3">
                <LuMapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" aria-hidden />
                <div>
                  <p className="font-semibold text-charcoal-900">Expo Help Desk (In-Person)</p>
                  <p className="text-charcoal-600 mt-0.5">{EVENT.expo.venue}</p>
                  <p className="text-[11px] text-charcoal-500 mt-1">
                    Operating during expo hours: {EVENT.expo.days.map((d) => d.hours).join(", ")}
                  </p>
                </div>
              </div>

              <Notice tone="info" title="Urgent Race Morning Inquiries">
                On race morning, on-site helpdesks and technical timing desks will be functional starting at 04:30 AM at the main start/finish arena.
              </Notice>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
