import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LuArrowLeft, LuBadgeCheck, LuUserRound } from "react-icons/lu";
import { getVolunteerDashboardContext } from "@/lib/volunteerDashboard";
import { RegistrationMissing } from "@/components/dashboard/ActionItems";
import { Badge, Notice } from "@/components/ui";
import { VolunteerProfileHub } from "@/components/dashboard/volunteer/VolunteerProfileHub";
import { EVENT } from "@/lib/event";

export const metadata = {
  title: "Profile & Account Settings | Rajgir Marathon 2027",
};

export default async function VolunteerProfilePage() {
  const { user, load, data } = await getVolunteerDashboardContext("/dashboard/volunteer/profile");

  if (load.kind === "not-registered") return <RegistrationMissing roleLabel="Volunteer" registerHref="/register/volunteer" />;
  if (load.kind !== "ok" || !data) {
    return (
      <Notice tone="error" title="We could not load your profile details">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const { v, approved, role, volunteerId, shiftLabel, limited } = data;

  return (
    <div className="space-y-6 lg:space-y-8 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-charcoal-200 pb-5">
        <div>
          <Link
            href="/dashboard/volunteer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-brand-red transition-colors mb-2"
          >
            <LuArrowLeft className="h-3.5 w-3.5" aria-hidden />
            <span>Back to Volunteer Hub</span>
          </Link>
          <h1 className="font-barlow text-2xl sm:text-3xl font-bold text-charcoal-900 flex items-center gap-2.5">
            <LuUserRound className="h-7 w-7 text-brand-red" aria-hidden />
            <span>Volunteer Profile & Account Settings</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-charcoal-600">
            View your crew contact details, update account login password, and manage registration preferences.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{role}</Badge>
          <Badge tone="success">
            <LuBadgeCheck className="h-3.5 w-3.5" aria-hidden /> {approved ? "Approved Crew" : "Volunteer Member"}
          </Badge>
        </div>
      </div>

      {limited ? (
        <Notice tone="warning" title="Offline preview mode">
          Some edit capabilities are running in preview mode while backend systems synchronize. Changes will take effect once connectivity is restored.
        </Notice>
      ) : null}

      {/* Main Interactive Hub */}
      <VolunteerProfileHub
        initial={{
          fullName: v.fullName,
          email: v.email,
          phone: v.phone,
          volunteerId,
          rolePreference: v.rolePreference,
          assignedRole: v.assignedRole,
          assignedStation: v.assignedStation,
          assignedSector: v.assignedSector,
          supervisorName: v.supervisorName,
          supervisorPhone: v.supervisorPhone,
          shiftLabel,
          tshirtSize: v.tShirtSize,
          languagesSpoken: v.languagesSpoken,
          dietaryRestrictions: v.dietaryRestrictions,
          medicalCertification: v.medicalCertification,
          emergencyContactName: v.emergencyContactName,
          emergencyContactPhone: v.emergencyContactPhone,
          submittedAt: v.submittedAt,
          status: v.status,
        }}
        readOnly={limited}
      />
    </div>
  );
}
