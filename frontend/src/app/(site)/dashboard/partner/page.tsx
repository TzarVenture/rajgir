import React from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { EVENT, formatDate } from "@/lib/event";
import { LuHandshake, LuHeadset, LuMail, LuMapPin, LuPhone, LuTicket } from "react-icons/lu";
import { Badge, StatCard } from "@/components/ui";
import { DashboardHeading, DetailList, SectionCard } from "@/components/dashboard/DashboardParts";

export const metadata = {
  title: "Commercial Partner Dashboard | Rajgir Marathon 2027",
};

const expoFirstDay = EVENT.expo.days[0].date;
/** Exhibitor move-in is the day before the expo opens. */
const moveInDay = new Date(new Date(`${expoFirstDay}T00:00:00+05:30`).getTime() - 86_400_000);
const expoRange = `${formatDate(expoFirstDay, { year: undefined })} - ${formatDate(EVENT.raceDate)}`;

export default async function PartnerDashboard() {
  const user = await requireUser("/dashboard/partner");

  if (!user.role || !["SPONSOR", "VENDOR", "TOURISM_PARTNER"].includes(user.role)) {
    redirect("/dashboard");
  }

  const roleTitles: Record<string, string> = {
    SPONSOR: "Official Marathon Sponsor",
    VENDOR: "Marathon Expo & Food Stall Vendor",
    TOURISM_PARTNER: "Official Tourism & Hospitality Partner",
  };

  const isSponsor = user.role === "SPONSOR";
  const isVendor = user.role === "VENDOR";
  const isTourism = user.role === "TOURISM_PARTNER";

  return (
    <div className="space-y-6 lg:space-y-8">
      <DashboardHeading
        eyebrow={
          <>
            <Badge tone="brand">Commercial partner: {roleTitles[user.role]}</Badge>
            <Badge tone="success">Accredited partner</Badge>
          </>
        }
        title={`Welcome, Partner ${user.name}`}
        subtitle={`Registered partner account: ${user.email} | Mobile: ${user.phone || "-"}`}
        actions={<Badge tone="warning">Official commercial portal</Badge>}
      />

      <section aria-label="Partnership overview" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Partner domain"
          value={isSponsor ? "Brand sponsor" : isVendor ? "Expo retailer" : "Hotels & travel"}
          icon={LuHandshake}
          hint="Accredited tier"
        />
        <StatCard label="Expo location" value="Kund Ground, Rajgir" icon={LuMapPin} hint={expoRange} />
        <StatCard label="VIP accreditation" value="Stage passes active" icon={LuTicket} hint="Podium & VIP lounge" />
        <StatCard label="Partnership desk" value="Dedicated manager" icon={LuHeadset} hint="Direct support" />
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SectionCard
          title={
            isSponsor
              ? "Sponsorship deliverables and brand assets"
              : isVendor
                ? "Stall allocation and setup guidelines"
                : "Tourism listing and runner guide feature"
          }
          tag={<Badge tone="success">Accredited</Badge>}
        >
          {isSponsor && (
            <div className="space-y-4 text-sm text-charcoal-700">
              <p>
                Your brand assets and logos have been assigned to official marathon collateral (race bibs, finish gantry,
                and press backdrop).
              </p>
              <DetailList
                rows={[
                  { label: "Logo submissions", value: <Badge tone="success">Vector SVG/EPS approved</Badge> },
                  { label: "VIP passes", value: "4 Passes (Finish Line VIP Enclosure)" },
                ]}
              />
            </div>
          )}

          {isVendor && (
            <div className="space-y-4 text-sm text-charcoal-700">
              <p>
                Your stall footprint is reserved at the Marathon Expo. Exhibitor setup commences {formatDate(moveInDay)} at 10:00
                AM (provisional).
              </p>
              <DetailList
                rows={[
                  { label: "Move-in schedule", value: `${formatDate(moveInDay)}, 10:00 AM - 08:00 PM` },
                  { label: "Power allotment", value: "15A Dedicated Power Supply" },
                ]}
              />
            </div>
          )}

          {isTourism && (
            <div className="space-y-4 text-sm text-charcoal-700">
              <p>
                Your hospitality establishment is published on the official Rajgir Marathon accommodation portal for
                verified athletes.
              </p>
              <DetailList
                rows={[
                  { label: "Official portal status", value: <Badge tone="success">Listed as preferred stay</Badge> },
                  { label: "Bib discount code", value: "RJGIR2027STAY" },
                ]}
              />
            </div>
          )}
        </SectionCard>

        <SectionCard title="Commercial liaison desk" tag={<Badge tone="info">Direct support</Badge>}>
          <div className="space-y-4 text-sm text-charcoal-700">
            <p>
              Our corporate relations and venue operations team is available to assist with logistics, passes, and booth
              requirements.
            </p>
            <DetailList
              rows={[
                {
                  label: "Commercial desk",
                  value: (
                    <span className="inline-flex items-center gap-2">
                      <LuPhone className="h-4 w-4 text-charcoal-500" aria-hidden />
                      +91 612 222 7890
                    </span>
                  ),
                },
                {
                  label: "Partnership email",
                  value: (
                    <span className="inline-flex items-center gap-2 break-all">
                      <LuMail className="h-4 w-4 shrink-0 text-charcoal-500" aria-hidden />
                      partners@rajgirmarathon.com
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
