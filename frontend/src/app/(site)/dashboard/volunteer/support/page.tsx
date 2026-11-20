import React from "react";
import Link from "next/link";
import {
  LuArrowLeft,
  LuBadgeCheck,
  LuCircleAlert,
  LuLifeBuoy,
  LuMail,
  LuMapPin,
  LuPhoneCall,
  LuRadio,
  LuShieldAlert,
  LuTicket,
  LuUserCheck,
} from "react-icons/lu";
import { getVolunteerDashboardContext } from "@/lib/volunteerDashboard";
import { RegistrationMissing } from "@/components/dashboard/ActionItems";
import { Badge, Notice } from "@/components/ui";
import { SectionCard } from "@/components/dashboard/DashboardParts";
import { VolunteerSubpageHeader } from "@/components/dashboard/volunteer/VolunteerSubpageHeader";
import { SupportFaqAccordion } from "@/components/dashboard/support/SupportFaqAccordion";
import { SupportTicketForm } from "@/components/dashboard/support/SupportTicketForm";
import {
  VOLUNTEER_CATEGORIES,
  VOLUNTEER_FAQS,
  VOLUNTEER_SUPPORT_TOPICS,
} from "@/lib/supportData";
import { EVENT } from "@/lib/event";

export const metadata = {
  title: "Volunteer Support & Operations Helpdesk | Rajgir Marathon 2027",
};

export default async function VolunteerSupportPage() {
  const { load, data } = await getVolunteerDashboardContext("/dashboard/volunteer/support");

  if (load.kind === "not-registered") {
    return <RegistrationMissing roleLabel="Volunteer" registerHref="/register/volunteer" />;
  }
  if (load.kind !== "ok" || !data) {
    return (
      <Notice tone="error" title="We could not load your volunteer helpdesk">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const { v, approved, role, color, volunteerId, shiftLabel, duty } = data;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Subpage Header with Navigation Tabs */}
      <VolunteerSubpageHeader
        title="Volunteer Support & Field Helpdesk"
        description="Dedicated operations support desk for volunteer crew. Fast answers, supervisor contacts, shift inquiries, and emergency escalation lines."
        role={role}
        station={v.assignedStation}
        sector={v.assignedSector}
        sectorColor={color}
        duty={duty}
        approved={approved}
        activeHref="/dashboard/volunteer/support"
      />

      {/* Volunteer Crew Identity & Station Deployment Card */}
      <div className="rounded-card border border-charcoal-200 bg-white p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-100 pb-3">
          <div>
            <span className="text-xs font-semibold text-charcoal-500">Authenticated Crew Identity</span>
            <h2 className="font-barlow text-lg font-bold text-charcoal-900">{v.fullName}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-red-light px-3 py-1 font-mono text-xs font-bold text-brand-red-dark">
              {volunteerId}
            </span>
            <span className="rounded-full bg-charcoal-100 px-3 py-1 text-xs font-semibold text-charcoal-700">
              {v.assignedStation ? v.assignedStation : "Station Pending"}
            </span>
            {v.assignedSector ? (
              <span
                className="rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{ backgroundColor: color }}
              >
                Sector {v.assignedSector}
              </span>
            ) : null}
            <Badge tone={approved ? "success" : "warning"}>
              {approved ? "Approved Crew" : "Under Review"}
            </Badge>
          </div>
        </div>

        <p className="mt-3 text-xs text-charcoal-600">
          Your active crew registration and duty station are automatically tagged to every inquiry submitted through this desk, ensuring direct routing to your sector coordinator without unnecessary delay.
        </p>
      </div>

      {/* Main Two-Column Layout: FAQs + Ticket Submission & Helplines */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column (7 cols): Knowledge Base & FAQs */}
        <div className="space-y-6 lg:col-span-7">
          <SectionCard
            title="Volunteer Knowledge Base & Field FAQs"
            description="Quick answers for shift reporting, uniform collection, meal tokens, attendance tracking, and service certificates."
            tag={<Badge tone="neutral">Searchable Guide</Badge>}
          >
            <SupportFaqAccordion
              faqs={VOLUNTEER_FAQS}
              categories={VOLUNTEER_CATEGORIES}
              searchPlaceholder="Search crew help (e.g. reporting time, uniform, meal tokens, medical SOS)..."
            />
          </SectionCard>
        </div>

        {/* Right Column (5 cols): Ticket Form & Helpline Contacts */}
        <div className="space-y-6 lg:col-span-5">
          <SectionCard
            title="Submit a Crew Support Ticket"
            description="Have a question that is not covered in the FAQ? Send a ticket directly to the volunteer coordination committee."
            tag={<Badge tone="brand">Volunteer Desk</Badge>}
          >
            <SupportTicketForm
              context={{
                athleteName: v.fullName,
                email: v.email,
                phone: v.phone,
                registrationNumber: volunteerId,
                roleLabel: role,
              }}
              topics={VOLUNTEER_SUPPORT_TOPICS}
            />
          </SectionCard>

          {/* Official Crew Helplines & Supervisor Contacts */}
          <SectionCard
            title="Direct Field Helplines & Supervisor Contacts"
            tag={<Badge tone="info">Race Operations</Badge>}
          >
            <div className="space-y-4 text-xs sm:text-sm text-charcoal-700">
              {/* Emergency SOS Line */}
              <div className="flex items-start gap-3 rounded-btn border border-red-200 bg-red-50/60 p-3">
                <LuShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" aria-hidden />
                <div>
                  <p className="font-semibold text-charcoal-900">Medical SOS & Incident Escalation</p>
                  <a
                    href="tel:+919431099999"
                    className="text-brand-red font-mono text-xs font-bold hover:underline"
                  >
                    +91 94310 99999
                  </a>
                  <p className="text-[11px] text-charcoal-600 mt-1">
                    Priority line for runner collapse, acute trauma, or heat stroke.
                  </p>
                </div>
              </div>

              {/* Station Supervisor */}
              <div className="flex items-start gap-3 rounded-btn border border-charcoal-200 bg-surface-soft p-3">
                <LuUserCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" aria-hidden />
                <div>
                  <p className="font-semibold text-charcoal-900">Your Sector Supervisor</p>
                  {v.supervisorName ? (
                    <>
                      <p className="text-charcoal-800 font-medium text-xs mt-0.5">{v.supervisorName}</p>
                      {v.supervisorPhone ? (
                        <a
                          href={`tel:${v.supervisorPhone}`}
                          className="text-brand-red font-mono text-xs hover:underline block mt-0.5"
                        >
                          {v.supervisorPhone}
                        </a>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-charcoal-500 text-xs mt-0.5">
                      Assigned supervisor details will be announced during briefing.
                    </p>
                  )}
                  <p className="text-[11px] text-charcoal-500 mt-1">Direct field report & station lead</p>
                </div>
              </div>

              {/* Volunteer Central Desk */}
              <div className="flex items-start gap-3 rounded-btn border border-charcoal-200 bg-surface-soft p-3">
                <LuPhoneCall className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" aria-hidden />
                <div>
                  <p className="font-semibold text-charcoal-900">Volunteer Operations Control Desk</p>
                  <p className="text-charcoal-600 mt-0.5 font-mono text-xs">+91 94310 12345 / +91 94310 67890</p>
                  <p className="text-[11px] text-charcoal-500 mt-1">Operational 05:00 AM – 08:00 PM IST</p>
                </div>
              </div>

              {/* Coordinator Email */}
              <div className="flex items-start gap-3 rounded-btn border border-charcoal-200 bg-surface-soft p-3">
                <LuMail className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" aria-hidden />
                <div>
                  <p className="font-semibold text-charcoal-900">Volunteer Coordinator Email</p>
                  <p className="text-charcoal-600 mt-0.5 font-mono text-xs">{EVENT.contacts.helpEmail}</p>
                  <p className="text-[11px] text-charcoal-500 mt-1">Direct ticketing & schedule adjustments</p>
                </div>
              </div>

              {/* Radio & Channel */}
              <div className="flex items-start gap-3 rounded-btn border border-charcoal-200 bg-surface-soft p-3">
                <LuRadio className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" aria-hidden />
                <div>
                  <p className="font-semibold text-charcoal-900">VHF Radio Protocol (Station Leads)</p>
                  <p className="text-charcoal-600 mt-0.5 font-mono text-xs">Channel 4 (Field & Course Safety)</p>
                  <p className="text-[11px] text-charcoal-500 mt-1">Keep radio etiquette strictly operational</p>
                </div>
              </div>

              <Notice tone="info" title="Urgent Race Morning Inquiries">
                On race morning, station supervisors and mobile marshals are active on VHF Channel 4 and mobile. For immediate runner medical assistance, use the Medical SOS hotline immediately.
              </Notice>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
