import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import {
  FaUsers,
  FaBuilding,
  FaGraduationCap,
  FaFileInvoiceDollar,
  FaUserPlus,
  FaDownload,
  FaCopy,
  FaShieldAlt,
  FaEnvelope,
} from "react-icons/fa";

export const metadata = {
  title: "Group Delegation Dashboard | Rajgir Marathon 2027",
};

export default async function GroupDashboard() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (!user.role || !["TEAM_CAPTAIN", "CORPORATE_MANAGER", "SCHOOL_COORDINATOR"].includes(user.role)) {
    redirect("/dashboard");
  }

  const roleTitles: Record<string, string> = {
    TEAM_CAPTAIN: "Running Squad & Team Captain",
    CORPORATE_MANAGER: "Corporate Wellness Delegation",
    SCHOOL_COORDINATOR: "School & College Contingent",
  };

  const isTeam = user.role === "TEAM_CAPTAIN";
  const isCorporate = user.role === "CORPORATE_MANAGER";
  const isSchool = user.role === "SCHOOL_COORDINATOR";

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#120e0a] to-[#1c140d] border border-[#cca043]/30 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#cca043] bg-[#cca043]/15 border border-[#cca043]/30 px-3 py-0.5 rounded-full">
              Group Delegation • {roleTitles[user.role]}
            </span>
            <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
              Active Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-white font-graduate">
            Welcome, Captain / Manager {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Authorized Account: {user.email} • Mobile: {user.phone || "—"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isCorporate && (
            <span className="py-2 px-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
              B2B Invoicing Ready
            </span>
          )}
          {isSchool && (
            <span className="py-2 px-4 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold">
              Institutional Pass Tier
            </span>
          )}
        </div>
      </div>

      {/* Overview Stat Widgets */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#0f0c09] border border-white/10 space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Delegation Type</p>
          <p className="text-lg font-black text-white font-graduate">
            {isTeam && "Athletic Club"}
            {isCorporate && "Corporate CSR"}
            {isSchool && "School / College"}
          </p>
          <p className="text-[11px] text-neutral-400">Bulk Pass Enrollment</p>
        </div>

        <div className="p-5 rounded-xl bg-[#0f0c09] border border-white/10 space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Kit Collection Mode</p>
          <p className="text-lg font-black text-[#cca043] font-graduate">
            Consolidated Pickup
          </p>
          <p className="text-[11px] text-neutral-400">Expo Group Desk A4</p>
        </div>

        <div className="p-5 rounded-xl bg-[#0f0c09] border border-white/10 space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Group Invoicing</p>
          <p className="text-lg font-black text-emerald-400 font-graduate">
            GST Compliant
          </p>
          <p className="text-[11px] text-neutral-400">B2B Tax Invoices Available</p>
        </div>

        <div className="p-5 rounded-xl bg-[#0f0c09] border border-white/10 space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Liaison Officer</p>
          <p className="text-lg font-black text-white font-graduate">
            Assigned
          </p>
          <p className="text-[11px] text-neutral-400">Direct WhatsApp &amp; Desk</p>
        </div>
      </section>

      {/* Roster & Squad Management */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#0f0c09] border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-lg font-extrabold uppercase text-white font-graduate">
              Delegation Roster &amp; Member Passes
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Manage your participants, allocate race distances, and track bib assignments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="py-2 px-4 rounded-lg bg-white/5 border border-white/15 text-white hover:border-[#cca043] hover:text-[#cca043] text-xs font-bold transition flex items-center gap-1.5"
            >
              <FaDownload className="text-[10px]" />
              <span>Download Roster CSV</span>
            </button>
          </div>
        </div>

        {/* Informative Placeholder Notice */}
        <div className="p-8 rounded-xl bg-black/40 border border-white/5 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#cca043]/10 border border-[#cca043]/30 flex items-center justify-center text-[#cca043] text-xl">
            <FaUsers />
          </div>
          <h3 className="text-base font-bold text-white font-graduate">
            Group Roster Syncing Active
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
            Your group delegation is registered with the organizing committee. As your members register using your delegation credentials, their bib allotments will appear here in real time.
          </p>
        </div>
      </section>
    </div>
  );
}

