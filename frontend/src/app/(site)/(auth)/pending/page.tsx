import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth/session";
import {
  FaClock,
  FaShieldAlt,
  FaCheckCircle,
  FaPhoneAlt,
  FaEnvelope,
  FaArrowRight,
  FaSignOutAlt,
} from "react-icons/fa";

export const metadata = {
  title: "Application Under Review | Rajgir Marathon 2027",
  description: "Your registration application is currently under review by the organizing committee.",
};

export default async function PendingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // If approved and active, go straight to dashboard
  if (user.status === "ACTIVE") {
    redirect("/dashboard");
  }

  // If role is not selected yet, go pick intent
  if (!user.role || user.status === "PENDING_ONBOARDING") {
    redirect("/onboarding/intent");
  }

  const roleLabels: Record<string, string> = {
    VOLUNTEER: "Event Volunteer",
    INFLUENCER: "Influencer / Creator Ambassador",
    TEAM_CAPTAIN: "Team Captain",
    CORPORATE_MANAGER: "Corporate Delegation",
    SCHOOL_COORDINATOR: "School & College Contingent",
    SPONSOR: "Commercial Brand Sponsor",
    VENDOR: "Marathon Expo & Food Stall Vendor",
    TOURISM_PARTNER: "Tourism & Hospitality Partner",
  };

  const displayRole = roleLabels[user.role] || user.role.replace(/_/g, " ");

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-2xl bg-[#0f0c09] border border-amber-500/30 shadow-2xl text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600" />

      {/* Clock Icon */}
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-3xl">
        <FaClock className="animate-pulse" />
      </div>

      <span className="inline-block text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full mb-3">
        Application Under Review
      </span>

      <h1 className="text-2xl sm:text-3xl font-black uppercase text-white font-graduate mb-2">
        {displayRole}
      </h1>

      <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto mb-6 leading-relaxed">
        Thank you, <span className="text-white font-bold">{user.name}</span>. Your application has been logged in the official Rajgir Marathon system and is awaiting organizing committee accreditation.
      </p>

      {/* Application Summary Box */}
      <div className="p-4 rounded-xl bg-black/50 border border-white/10 mb-6 text-left space-y-2.5 text-xs">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-neutral-400">Account Identity:</span>
          <span className="text-white font-semibold">{user.email}</span>
        </div>
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-neutral-400">Mobile Phone:</span>
          <span className="text-white font-semibold">{user.phone || "—"}</span>
        </div>
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-neutral-400">Application Track:</span>
          <span className="text-[#cca043] font-semibold">{displayRole}</span>
        </div>
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-neutral-400">Review Status:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            Pending Committee Review
          </span>
        </div>
      </div>

      {/* Expected Timeline Callout */}
      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/30 text-xs text-amber-200/90 text-left space-y-1.5 mb-6">
        <div className="flex items-center gap-2 font-bold text-amber-400">
          <FaShieldAlt className="text-sm" />
          <span>What Happens Next?</span>
        </div>
        <p className="text-neutral-300 leading-relaxed text-[11.5px]">
          Our operational team verifies credentials, allotments, and safety guidelines. You will receive an official confirmation via SMS and Email within 48 to 72 business hours.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Link
          href="/pending"
          className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[#cca043] to-[#b3852b] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
        >
          <span>Refresh Application Status</span>
          <FaArrowRight className="text-xs" />
        </Link>

        <form action={logout}>
          <button
            type="submit"
            className="w-full py-2.5 px-4 text-xs font-semibold text-neutral-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FaSignOutAlt className="text-[11px]" />
            <span>Sign Out of Account</span>
          </button>
        </form>
      </div>

      {/* Committee Helpline */}
      <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-neutral-500 flex flex-wrap items-center justify-center gap-4">
        <span className="flex items-center gap-1">
          <FaPhoneAlt className="text-[10px] text-[#cca043]" /> +91 612 222 3456
        </span>
        <span className="flex items-center gap-1">
          <FaEnvelope className="text-[10px] text-[#cca043]" /> committee@rajgirmarathon.com
        </span>
      </div>
    </div>
  );
}
