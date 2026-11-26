import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LuArrowRight,
  LuBadgeCheck,
  LuCircleCheck,
  LuClipboardList,
  LuFootprints,
  LuIdCard,
  LuReceipt,
  LuShieldAlert,
  LuTimer,
  LuUserRound,
} from "react-icons/lu";
import type { ApiRunnerRegistration } from "@/lib/api";
import { loadRunnerDashboard } from "@/lib/dashboardData";
import { ActionItems, RegistrationMissing, type ActionItem } from "@/components/dashboard/ActionItems";
import { authContext, requireUser } from "@/lib/auth/session";
import { raceCategories } from "@/lib/schemas/runnerRegistration";
import {
  EVENT,
  ageCategory,
  ageOnRaceDay,
  categoryOps,
  formatClock,
  formatCutoff,
  formatDate,
  formatDateTime,
  formatDuration,
  formatPace,
  nowMs,
  startDateTime,
} from "@/lib/event";
import { trainingPlan } from "@/lib/training";
import { hhmmToSeconds, addMinutes, computeCertificate } from "@/lib/runnerDashboardHelpers";
import { Badge, Card, Notice } from "@/components/ui";
import { DetailList } from "@/components/dashboard/DashboardParts";

export const metadata = {
  title: "Runner Overview Hub | Rajgir Marathon 2027",
};

function ProfileTile({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="flex min-w-0 flex-col justify-between rounded-card border border-charcoal-200 bg-white p-3.5 sm:p-4 shadow-2xs">
      <div>
        <p className="text-xs font-semibold text-charcoal-500">{label}</p>
        <div className="mt-1 font-barlow text-xl sm:text-2xl font-bold leading-snug text-charcoal-900 break-words whitespace-normal">
          {value}
        </div>
      </div>
      {hint ? (
        <p className="mt-2 text-xs text-charcoal-500 leading-normal break-words whitespace-normal">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default async function RunnerDashboard() {
  const user = await requireUser("/dashboard/runner");
  if (user.role !== "RUNNER") redirect("/dashboard");

  const ctx = await authContext();
  const load = ctx
    ? await loadRunnerDashboard(ctx)
    : ({ kind: "error", message: "Your session has expired. Please sign in again." } as const);

  if (load.kind === "not-registered") return <RegistrationMissing roleLabel="Runner" registerHref="/register/runner" />;
  if (load.kind !== "ok") {
    return (
      <Notice tone="error" title="We could not load your race dashboard">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const r: ApiRunnerRegistration = load.data;
  const limited = load.limited;
  const ops = categoryOps(r.distance);
  const category = raceCategories.find((c) => c.distance === r.distance);
  const fullName = `${r.firstName} ${r.lastName}`.trim();
  const age = ageOnRaceDay(r.dateOfBirth);
  const ageGroup = r.result?.ageCategory ?? ageCategory(r.gender, age, r.distance);
  const startIso = startDateTime(r.distance);
  const startLabel = formatClock(ops.startTime);
  const raceOver = nowMs() > new Date(startIso).getTime() + ops.cutoffMinutes * 60_000;
  const targetSeconds = ops.timed ? hhmmToSeconds(r.estimatedFinishTime) : null;
  const addons = Array.isArray(r.selectedAddons) ? r.selectedAddons : [];
  const training = trainingPlan(r.distance);

  const { certificate, lockedReason } = computeCertificate(r, fullName, ageGroup, ops, raceOver);

  // Runner To-Do List with direct navigation to dedicated subroutes
  const paid = !r.paymentStatus || r.paymentStatus.toUpperCase() === "CONFIRMED";
  const expoStart = new Date(`${EVENT.expo.days[0].date}T00:00:00+05:30`).getTime();
  const expoOpenSoon = nowMs() >= expoStart - 14 * 86_400_000;

  const todo: ActionItem[] = [
    {
      id: "entry",
      title: "Race entry confirmed",
      detail: paid
        ? `Registration ${r.registrationNumber} for the ${r.distance} ${r.raceTitle}.`
        : `Payment status: ${r.paymentStatus}. Complete payment to confirm your entry.`,
      state: paid ? "done" : "todo",
      action: paid ? undefined : { label: "Contact help desk", href: "/dashboard/runner/support" },
    },
    {
      id: "medical",
      title: "Check your medical and emergency details",
      detail: r.medicalUpdatedAt
        ? `Confirmed ${formatDateTime(r.medicalUpdatedAt)}. Update them any time before race morning.`
        : "The medical team relies on your blood group, emergency contact and conditions. Check they are correct and save them once.",
      state: r.medicalUpdatedAt || raceOver ? "done" : "todo",
      action: limited ? undefined : { label: "Review details", href: "/dashboard/runner/medical" },
    },
    {
      id: "bib",
      title: "Bib number",
      detail: r.bibNumber
        ? `Bib #${r.bibNumber}.`
        : "The organizers allot bib numbers before the expo. Nothing to do yet.",
      state: r.bibNumber ? "done" : "waiting",
      action: { label: "View bib pass", href: "/dashboard/runner/bib" },
    },
    {
      id: "kit",
      title: "Collect your race kit at the expo",
      detail: r.kitCollectedAt
        ? `Collected ${formatDateTime(r.kitCollectedAt)}.`
        : `${EVENT.expo.venue}, ${EVENT.expo.days.map((d) => formatDate(d.date, { year: undefined, weekday: "short" })).join(" and ")}. No pickup on race morning.`,
      state: r.kitCollectedAt ? "done" : raceOver ? "done" : expoOpenSoon ? "todo" : "later",
      action: { label: "Pickup details", href: "/dashboard/runner/bib" },
    },
    {
      id: "race",
      title: "Race day",
      detail: r.result
        ? `Official result published: ${r.result.status === "FINISHED" ? formatDuration(r.result.netTimeSeconds) : r.result.status}.`
        : `Gun time ${startLabel}, ${formatDate(EVENT.raceDate, { weekday: "long" })} at ${EVENT.startFinish}.`,
      state: r.result ? "done" : raceOver ? "waiting" : "later",
      action: { label: "See splits", href: "/dashboard/runner/splits" },
    },
    {
      id: "certificate",
      title: ops.timed ? "Finisher certificate" : "Participation certificate",
      detail: certificate ? "Ready to view and print." : lockedReason,
      state: certificate ? "todo" : "later",
      action: certificate ? { label: "View certificate", href: "/dashboard/runner/invoice" } : undefined,
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* ---------- Athletic Profile Hero ---------- */}
      <Card padded={false} className="overflow-hidden">
        <div className="h-2" style={{ backgroundColor: ops.bibColor }} aria-hidden />
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start sm:items-center gap-4">
              <span
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-barlow text-2xl font-bold shadow-xs"
                style={{ backgroundColor: ops.bibColor, color: ops.bibInk }}
                aria-hidden
              >
                {(r.firstName[0] ?? "") + (r.lastName[0] ?? "")}
              </span>
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge tone="brand">{r.distance} {r.raceTitle}</Badge>
                  <Badge tone={ops.timed ? "info" : "neutral"}>{ops.timed ? "Chip Timed" : "Non-Timed"}</Badge>
                  <Badge tone="success">
                    <LuCircleCheck className="h-3 w-3" aria-hidden /> Entry {String(r.paymentStatus ?? "confirmed").toLowerCase()}
                  </Badge>
                </div>
                <h1 className="font-barlow text-[28px] font-bold leading-tight text-charcoal-900 sm:text-[34px] break-words">
                  {fullName}
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm text-charcoal-600">
                  {r.gender}, {age} on race day | {r.city}, {r.state}
                  {r.runningClub ? ` | ${r.runningClub}` : ""}
                </p>
              </div>
            </div>

            {/* Quick Access Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Link
                href="/dashboard/runner/bib"
                className="inline-flex min-h-[42px] items-center gap-2 rounded-btn bg-brand-red px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-red-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
              >
                <LuIdCard className="h-4 w-4 shrink-0" aria-hidden />
                <span>Digital Bib Pass</span>
              </Link>
              <Link
                href="/dashboard/runner/splits"
                className="inline-flex min-h-[42px] items-center gap-2 rounded-btn border border-charcoal-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-charcoal-800 shadow-2xs transition-colors hover:bg-charcoal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
              >
                <LuTimer className="h-4 w-4 shrink-0 text-brand-red" aria-hidden />
                <span>Race & Splits</span>
              </Link>
              <Link
                href="/dashboard/runner/medical"
                className="inline-flex min-h-[42px] items-center gap-2 rounded-btn border border-charcoal-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-charcoal-800 shadow-2xs transition-colors hover:bg-charcoal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
              >
                <LuShieldAlert className="h-4 w-4 shrink-0 text-brand-red" aria-hidden />
                <span>Medical Info</span>
              </Link>
              <Link
                href="/dashboard/runner/invoice"
                className="inline-flex min-h-[42px] items-center gap-2 rounded-btn border border-charcoal-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-charcoal-800 shadow-2xs transition-colors hover:bg-charcoal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
              >
                <LuReceipt className="h-4 w-4 shrink-0 text-charcoal-600" aria-hidden />
                <span>Tax Invoice</span>
              </Link>
              <Link
                href="/dashboard/runner/profile"
                className="inline-flex min-h-[42px] items-center gap-2 rounded-btn border border-charcoal-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-charcoal-800 shadow-2xs transition-colors hover:bg-charcoal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
              >
                <LuUserRound className="h-4 w-4 shrink-0 text-brand-red" aria-hidden />
                <span>My Profile</span>
              </Link>
            </div>
          </div>

          {/* Key Telemetry Tiles: Adaptive Grid, Guaranteed Zero Truncation */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 sm:gap-4">
            <ProfileTile
              label="Registration no."
              value={<span className="font-mono text-base font-bold tracking-tight sm:text-lg lg:text-xl break-all sm:break-normal">{r.registrationNumber}</span>}
              hint={`Since ${formatDate(r.createdAt)}`}
            />
            <ProfileTile
              label="Bib number"
              value={r.bibNumber ?? "To be allotted"}
              hint={r.bibNumber ? "Printed on your bib" : "Allotted before the expo"}
            />
            <ProfileTile
              label="Age group"
              value={<span className="text-lg font-bold sm:text-xl">{ageGroup}</span>}
              hint="Used for category rankings"
            />
            <ProfileTile
              label="Gun start"
              value={startLabel}
              hint="Race-day flag-off (IST)"
            />
            <ProfileTile
              label="Expected finish"
              value={targetSeconds ? formatDuration(targetSeconds) : "-"}
              hint={targetSeconds ? `Target pace ${formatPace(targetSeconds, ops.distanceKm)}` : ops.timed ? "Not provided" : "Non-timed run"}
            />
            <ProfileTile
              label="Cut-off"
              value={formatCutoff(ops.cutoffMinutes)}
              hint={`Course closes ${formatClock(addMinutes(ops.startTime, ops.cutoffMinutes))}`}
            />
          </div>
        </div>
      </Card>

      {/* ---------- Dedicated Category Cards: Complete Dashboard Overview Hub ---------- */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-barlow text-xl sm:text-2xl font-bold text-charcoal-900">Runner Hub Sections</h2>
          <span className="text-xs text-charcoal-500 font-medium">6 Dedicated Modules</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Digital Bib Pass & Expo Kit */}
          <Link
            href="/dashboard/runner/bib"
            className="group flex flex-col justify-between rounded-card border border-charcoal-200 bg-white p-5 shadow-2xs transition-all hover:border-brand-red hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red-light text-brand-red">
                  <LuIdCard className="h-5 w-5" aria-hidden />
                </span>
                <Badge tone={r.bibNumber ? "brand" : "neutral"}>
                  {r.bibNumber ? `Bib #${r.bibNumber}` : "Pending Allotment"}
                </Badge>
              </div>
              <h3 className="mt-3 font-barlow text-lg font-bold text-charcoal-900 group-hover:text-brand-red transition-colors">
                Digital Bib Pass & Kit Pickup
              </h3>
              <p className="mt-1 text-xs text-charcoal-600 line-clamp-2">
                Interactive 3D flip card with verified QR pass, expo schedule, venue details, and mandatory documents.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-red">
              <span>Open Bib Pass</span>
              <LuArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
            </div>
          </Link>

          {/* Card 2: Race Day & Splits */}
          <Link
            href="/dashboard/runner/splits"
            className="group flex flex-col justify-between rounded-card border border-charcoal-200 bg-white p-5 shadow-2xs transition-all hover:border-brand-red hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <LuTimer className="h-5 w-5" aria-hidden />
                </span>
                <Badge tone={ops.timed ? "info" : "neutral"}>
                  {ops.timed ? "RFID Chip Timed" : "Fun Run"}
                </Badge>
              </div>
              <h3 className="mt-3 font-barlow text-lg font-bold text-charcoal-900 group-hover:text-brand-red transition-colors">
                Race Day & Checkpoint Splits
              </h3>
              <p className="mt-1 text-xs text-charcoal-600 line-clamp-2">
                Live countdown to gun time, course elevation specifications, and detailed RFID timing checkpoint splits.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-red">
              <span>View Splits Matrix</span>
              <LuArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
            </div>
          </Link>

          {/* Card 3: Medical Profile */}
          <Link
            href="/dashboard/runner/medical"
            className="group flex flex-col justify-between rounded-card border border-charcoal-200 bg-white p-5 shadow-2xs transition-all hover:border-brand-red hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <LuShieldAlert className="h-5 w-5" aria-hidden />
                </span>
                <Badge tone={r.medicalUpdatedAt ? "success" : "warning"}>
                  {r.medicalUpdatedAt ? "Verified" : "Review Needed"}
                </Badge>
              </div>
              <h3 className="mt-3 font-barlow text-lg font-bold text-charcoal-900 group-hover:text-brand-red transition-colors">
                Medical & Emergency Profile
              </h3>
              <p className="mt-1 text-xs text-charcoal-600 line-clamp-2">
                In-place editable emergency profile for course medical responders: blood group, contact phone, and conditions.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-red">
              <span>Manage Medical Details</span>
              <LuArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
            </div>
          </Link>

          {/* Card 4: Training Progression */}
          <Link
            href="/dashboard/runner/training"
            className="group flex flex-col justify-between rounded-card border border-charcoal-200 bg-white p-5 shadow-2xs transition-all hover:border-brand-red hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <LuFootprints className="h-5 w-5" aria-hidden />
                </span>
                <Badge tone="neutral">{training.totalWeeks} Weeks Plan</Badge>
              </div>
              <h3 className="mt-3 font-barlow text-lg font-bold text-charcoal-900 group-hover:text-brand-red transition-colors">
                Weekly Training Progression
              </h3>
              <p className="mt-1 text-xs text-charcoal-600 line-clamp-2">
                Periodized weekly mileage build-up, weekend long run milestones, and safe taper tailored for the {r.distance}.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-red">
              <span>Explore Training Plan</span>
              <LuArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
            </div>
          </Link>

          {/* Card 5: Invoice & Finisher Certificate */}
          <Link
            href="/dashboard/runner/invoice"
            className="group flex flex-col justify-between rounded-card border border-charcoal-200 bg-white p-5 shadow-2xs transition-all hover:border-brand-red hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <LuReceipt className="h-5 w-5" aria-hidden />
                </span>
                <Badge tone={certificate ? "success" : "neutral"}>
                  {certificate ? "Certificate Ready" : "Invoice Available"}
                </Badge>
              </div>
              <h3 className="mt-3 font-barlow text-lg font-bold text-charcoal-900 group-hover:text-brand-red transition-colors">
                GST Invoice & Certificate
              </h3>
              <p className="mt-1 text-xs text-charcoal-600 line-clamp-2">
                Official GST tax invoice breakdown, SAC line items, payment receipt, and official finisher certificate.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-red">
              <span>View Invoice & Certificate</span>
              <LuArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
            </div>
          </Link>

          {/* Card 6: Profile & Account Settings */}
          <Link
            href="/dashboard/runner/profile"
            className="group flex flex-col justify-between rounded-card border border-charcoal-200 bg-white p-5 shadow-2xs transition-all hover:border-brand-red hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <LuUserRound className="h-5 w-5" aria-hidden />
                </span>
                <Badge tone="brand">Athlete Profile</Badge>
              </div>
              <h3 className="mt-3 font-barlow text-lg font-bold text-charcoal-900 group-hover:text-brand-red transition-colors">
                Profile & Account Settings
              </h3>
              <p className="mt-1 text-xs text-charcoal-600 line-clamp-2">
                View & edit personal details, update password, and manage registration preferences.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-red">
              <span>Manage Profile & Security</span>
              <LuArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
            </div>
          </Link>
        </div>
      </div>

      {limited ? (
        <Notice tone="warning" title="Some live features are temporarily unavailable">
          Your registration is safe and shown below. Bib allotment, kit status, results and editing your medical details will appear here once our
          race systems finish updating. For urgent changes, contact {EVENT.contacts.helpEmail}.
        </Notice>
      ) : null}

      {/* ---------- Action Items / To-Do List ---------- */}
      <section aria-label="Action items">
        <ActionItems items={todo} />
      </section>

      {EVENT.schedulesProvisional ? (
        <Notice tone="info" title="Provisional race-day schedule">
          Start times and expo hours are provisional until the official race handbook is published. We will notify you of any change.
        </Notice>
      ) : null}

      {/* ---------- Collapsible Original Registration Submission Record ---------- */}
      <details className="group rounded-card border border-charcoal-200 bg-white p-4 transition-all">
        <summary className="flex cursor-pointer items-center justify-between font-semibold text-charcoal-800 hover:text-charcoal-900">
          <span className="flex items-center gap-2 text-sm">
            <LuClipboardList className="h-4 w-4 text-charcoal-500" aria-hidden />
            View Original Registration Submission Record
          </span>
          <span className="text-xs text-charcoal-500 transition-transform group-open:rotate-180">▼</span>
        </summary>
        <div className="mt-4 pt-4 border-t border-charcoal-100 grid grid-cols-1 gap-6 md:grid-cols-2 text-sm">
          <div>
            <h4 className="mb-2 font-semibold text-charcoal-700">Athlete Identity</h4>
            <DetailList
              rows={[
                { label: "Full name", value: fullName },
                { label: "Name on bib", value: <span className="font-mono">{r.bibName}</span> },
                { label: "Date of birth", value: formatDate(r.dateOfBirth.slice(0, 10)) },
                { label: "Gender", value: r.gender },
                { label: "Email", value: <span className="break-all">{r.email}</span> },
                { label: "Mobile", value: `+91 ${r.phone}` },
                { label: "T-shirt size", value: r.tshirtSize },
              ]}
            />
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-charcoal-700">Logistics & Compliance</h4>
            <DetailList
              rows={[
                { label: "City / state", value: `${r.city}, ${r.state}` },
                { label: "Pincode", value: r.pincode },
                { label: "Country", value: r.country ?? "India" },
                { label: "Running club", value: r.runningClub ?? "Independent" },
                { label: "Add-ons selected", value: addons.length ? addons.map((a) => a.title).join(", ") : "None" },
                { label: "Waiver agreed", value: r.waiverAgreed ? "Signed electronically" : "Not signed" },
              ]}
            />
          </div>
        </div>
      </details>
    </div>
  );
}
