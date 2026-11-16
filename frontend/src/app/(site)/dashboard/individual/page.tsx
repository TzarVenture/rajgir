import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import {
  FaRunning,
  FaHandsHelping,
  FaBullhorn,
  FaIdCard,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTshirt,
  FaDownload,
  FaQrcode,
} from "react-icons/fa";

export const metadata = {
  title: "Individual Dashboard | Rajgir Marathon 2027",
};

export default async function IndividualDashboard() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
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
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#120e0a] to-[#1c140d] border border-[#cca043]/30 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#cca043] bg-[#cca043]/15 border border-[#cca043]/30 px-3 py-0.5 rounded-full">
              Individual Track • {roleTitles[user.role]}
            </span>
            <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
              Verified
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-white font-graduate">
            Welcome, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Registered Email: {user.email} • Mobile: {user.phone || "—"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isRunner && (
            <Link
              href="/register/runner"
              className="py-2.5 px-5 rounded-full bg-gradient-to-r from-[#cca043] to-[#b3852b] text-black font-extrabold text-xs uppercase tracking-wider shadow hover:brightness-110 transition-all flex items-center gap-2"
            >
              <FaIdCard className="text-sm" />
              <span>View Race Entry</span>
            </Link>
          )}
        </div>
      </div>

      {/* Overview Stat Widgets */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#0f0c09] border border-white/10 space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Race Date</p>
          <p className="text-lg font-black text-white font-graduate flex items-center gap-2">
            <FaCalendarAlt className="text-[#cca043] text-sm" />
            24 Jan 2027
          </p>
          <p className="text-[11px] text-neutral-400">Rajgir Historic Circuit</p>
        </div>

        <div className="p-5 rounded-xl bg-[#0f0c09] border border-white/10 space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Start / Finish Line</p>
          <p className="text-lg font-black text-white font-graduate flex items-center gap-2">
            <FaMapMarkerAlt className="text-[#cca043] text-sm" />
            Vishwa Shanti Stupa
          </p>
          <p className="text-[11px] text-neutral-400">Ratnagiri Hills, Rajgir</p>
        </div>

        <div className="p-5 rounded-xl bg-[#0f0c09] border border-white/10 space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Timing Technology</p>
          <p className="text-lg font-black text-emerald-400 font-graduate">
            UHF RFID Chip
          </p>
          <p className="text-[11px] text-neutral-400">Split Mats at 5K, 10K, 21K</p>
        </div>

        <div className="p-5 rounded-xl bg-[#0f0c09] border border-white/10 space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Kit Collection Expo</p>
          <p className="text-lg font-black text-[#cca043] font-graduate flex items-center gap-2">
            <FaTshirt className="text-sm" />
            22-23 Jan 2027
          </p>
          <p className="text-[11px] text-neutral-400">Kund Ground, Rajgir</p>
        </div>
      </section>

      {/* Role-Specific Action Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Official Race Card / Assignment */}
        <div className="p-6 rounded-2xl bg-[#0f0c09] border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-base font-extrabold uppercase text-white font-graduate">
              {isRunner && "Race Details & Bib Allocation"}
              {isVolunteer && "Volunteer Station & Reporting"}
              {isInfluencer && "Creator Accreditation & Kit"}
            </h2>
            <span className="text-xs font-bold text-[#cca043]">Active Entry</span>
          </div>

          {isRunner && (
            <div className="space-y-3 text-sm text-neutral-300">
              <p>Your runner profile is verified in the official race registry. Your bib number and timing chip are being personalized for pickup at the Marathon Expo.</p>
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Reporting Time:</span>
                  <span className="text-white font-semibold">05:00 AM IST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Hydration Stations:</span>
                  <span className="text-white font-semibold">Every 2.5 KM (Water + Electrolytes)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Medical Stations:</span>
                  <span className="text-white font-semibold">Mobile Ambulances + Finish Field Hospital</span>
                </div>
              </div>
            </div>
          )}

          {isVolunteer && (
            <div className="space-y-3 text-sm text-neutral-300">
              <p>Thank you for contributing to race safety and athlete experience. The Volunteer Coordinator will conduct a pre-race briefing one day prior at the Rajgir Stadium.</p>
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Mandatory Briefing:</span>
                  <span className="text-white font-semibold">23 Jan 2027, 03:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Kit Provided:</span>
                  <span className="text-white font-semibold">Volunteer Jersey + Cap + RFID Marshall Badge</span>
                </div>
              </div>
            </div>
          )}

          {isInfluencer && (
            <div className="space-y-3 text-sm text-neutral-300">
              <p>Your media ambassador credentials grant VIP course access, backstage interviews at the podium, and media center facilities.</p>
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Accreditation Pass:</span>
                  <span className="text-white font-semibold">All-Access Media Badge</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Official Hashtags:</span>
                  <span className="text-[#cca043] font-semibold">#RajgirMarathon2027 #RunInHistory</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Essential Guidelines & Downloads */}
        <div className="p-6 rounded-2xl bg-[#0f0c09] border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-base font-extrabold uppercase text-white font-graduate">
              Handbook &amp; Course Route
            </h2>
            <span className="text-xs font-bold text-neutral-400">Official Assets</span>
          </div>

          <div className="space-y-3 text-sm text-neutral-300">
            <p>Download essential event documentation and familiarize yourself with the Rajgir heritage course route.</p>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 hover:border-[#cca043]/30 transition-colors">
                <span className="text-xs font-medium text-white">Course Elevation &amp; Route Map</span>
                <span className="text-[11px] font-bold text-[#cca043]">PDF Available Soon</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 hover:border-[#cca043]/30 transition-colors">
                <span className="text-xs font-medium text-white">Expo Kit Pickup Instructions</span>
                <span className="text-[11px] font-bold text-[#cca043]">Expo Hall A</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 hover:border-[#cca043]/30 transition-colors">
                <span className="text-xs font-medium text-white">Medical &amp; Heat Protocol Guide</span>
                <span className="text-[11px] font-bold text-[#cca043]">Standard Protocol</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

