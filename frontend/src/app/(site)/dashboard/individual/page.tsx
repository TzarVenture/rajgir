import React from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { EVENT, formatDate, formatDateTime } from "@/lib/event";
import { LuCalendarDays, LuClipboardList, LuMapPin, LuRadio, LuShirt } from "react-icons/lu";
import { Badge, LinkButton, StatCard } from "@/components/ui";
import { DashboardHeading, DetailList, SectionCard } from "@/components/dashboard/DashboardParts";

export const metadata = {
  title: "Individual Dashboard | Rajgir Marathon 2027",
};

export default async function IndividualDashboard() {
  const user = await requireUser("/dashboard/individual");

  // Runners and volunteers have their own dashboards.
  if (user.role === "RUNNER") redirect("/dashboard/runner");
  if (user.role === "VOLUNTEER") redirect("/dashboard/volunteer");
  if (!user.role || !["RUNNER", "VOLUNTEER", "INFLUENCER"].includes(user.role)) {
    redirect("/dashboard");
  }

  const roleTitles: Record<string, string> = {
    RUNNER: "Official Marathon Runner",
    VOLUNTEER: "Race Day Volunteer Crew",
    INFLUENCER: "Creator & Athlete Ambassador",
  };

  const isRunner = user.role === "RUNNER";
  const isVolunteer = user.role === "VOLUNTEER";
  const isInfluencer = user.role === "INFLUENCER";

  return (
    <div className="space-y-6 lg:space-y-8">
      <DashboardHeading
        eyebrow={
          <>
            <Badge tone="brand">Individual track: {roleTitles[user.role]}</Badge>
            <Badge tone="success">Verified</Badge>
          </>
        }
        title={`Welcome, ${user.name}`}
        subtitle={`Registered email: ${user.email} | Mobile: ${user.phone || "-"}`}
        actions={
          isRunner ? (
            <LinkButton href="/register/runner" icon={LuClipboardList}>
              View race entry
            </LinkButton>
          ) : null
        }
      />

      <section aria-label="Event overview" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Race date" value={formatDate(EVENT.raceDate)} icon={LuCalendarDays} hint="Rajgir Historic Circuit" />
        <StatCard label="Start / finish line" value="Vishwa Shanti Stupa" icon={LuMapPin} hint="Ratnagiri Hills, Rajgir" />
        <StatCard label="Timing technology" value="UHF RFID chip" icon={LuRadio} hint="Split mats at 5K, 10K, 21K" />
        <StatCard
          label="Kit collection expo"
          value={`${formatDate(EVENT.expo.days[0].date, { year: undefined })} - ${formatDate(EVENT.expo.days[EVENT.expo.days.length - 1].date, { year: undefined })}`}
          icon={LuShirt}
          hint={EVENT.expo.venue}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SectionCard
          title={
            isRunner
              ? "Race details and bib allocation"
              : isVolunteer
                ? "Volunteer station and reporting"
                : "Creator accreditation and kit"
          }
          tag={<Badge tone="success">Active entry</Badge>}
        >
          {isRunner && (
            <div className="space-y-4 text-sm text-charcoal-700">
              <p>
                Your runner profile is verified in the official race registry. Your bib number and timing chip are being
                personalized for pickup at the Marathon Expo.
              </p>
              <DetailList
                rows={[
                  { label: "Reporting time", value: "05:00 AM IST" },
                  { label: "Hydration stations", value: "Every 2.5 KM (Water + Electrolytes)" },
                  { label: "Medical stations", value: "Mobile Ambulances + Finish Field Hospital" },
                ]}
              />
            </div>
          )}

          {isVolunteer && (
            <div className="space-y-4 text-sm text-charcoal-700">
              <p>
                Thank you for contributing to race safety and athlete experience. The Volunteer Coordinator will conduct a
                pre-race briefing one day prior at the Rajgir Stadium.
              </p>
              <DetailList
                rows={[
                  { label: "Mandatory briefing", value: formatDateTime(EVENT.volunteerBriefing.at) },
                  { label: "Kit provided", value: "Volunteer Jersey + Cap + RFID Marshall Badge" },
                ]}
              />
            </div>
          )}

          {isInfluencer && (
            <div className="space-y-4 text-sm text-charcoal-700">
              <p>
                Your media ambassador credentials grant VIP course access, backstage interviews at the podium, and media
                center facilities.
              </p>
              <DetailList
                rows={[
                  { label: "Accreditation pass", value: "All-Access Media Badge" },
                  { label: "Official hashtags", value: "#RajgirMarathon2027 #RunInHistory" },
                ]}
              />
            </div>
          )}
        </SectionCard>

        <SectionCard title="Handbook and course route" tag={<Badge tone="neutral">Official assets</Badge>}>
          <div className="space-y-4 text-sm text-charcoal-700">
            <p>Download essential event documentation and familiarize yourself with the Rajgir heritage course route.</p>
            <ul className="space-y-2">
              {[
                { name: "Course Elevation & Route Map", status: "PDF available soon", tone: "warning" as const },
                { name: "Expo Kit Pickup Instructions", status: "Expo Hall A", tone: "info" as const },
                { name: "Medical & Heat Protocol Guide", status: "Standard protocol", tone: "neutral" as const },
              ].map((doc) => (
                <li
                  key={doc.name}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-charcoal-200 bg-surface-soft p-3"
                >
                  <span className="font-medium text-charcoal-900">{doc.name}</span>
                  <Badge tone={doc.tone}>{doc.status}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
