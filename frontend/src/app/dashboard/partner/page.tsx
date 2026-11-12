import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import {
  FaAward,
  FaStore,
  FaHotel,
  FaHandshake,
  FaDownload,
  FaPhoneAlt,
  FaEnvelope,
  FaShieldAlt,
} from "react-icons/fa";

export const metadata = {
  title: "Commercial Partner Dashboard | Rajgir Marathon 2027",
};

export default async function PartnerDashboard() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
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
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#120e0a] to-[#1c140d] border border-[#cca043]/30 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#cca043] bg-[#cca043]/15 border border-[#cca043]/30 px-3 py-0.5 rounded-full">
              Commercial Partner • {roleTitles[user.role]}
            </span>
            <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
              Accredited Partner
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-white font-graduate">
            Welcome, Partner {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Registered Partner Account: {user.email} • Mobile: {user.phone || "—"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="py-2 px-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
            Official Commercial Portal
          </span>
        </div>
      </div>

      {/* Overview Stat Widgets */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#0f0c09] border border-white/10 space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Partner Domain</p>
          <p className="text-lg font-black text-white font-graduate">
            {isSponsor && "Brand Sponsor"}
            {isVendor && "Expo Retailer"}
            {isTourism && "Hotels & Travel"}
          </p>
          <p className="text-[11px] text-neutral-400">Accredited Tier</p>
        </div>

        <div className="p-5 rounded-xl bg-[#0f0c09] border border-white/10 space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Expo Location</p>
          <p className="text-lg font-black text-[#cca043] font-graduate">
            Kund Ground, Rajgir
          </p>
          <p className="text-[11px] text-neutral-400">22-24 January 2027</p>
        </div>

        <div className="p-5 rounded-xl bg-[#0f0c09] border border-white/10 space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">VIP Accreditation</p>
          <p className="text-lg font-black text-emerald-400 font-graduate">
            Stage Passes Active
          </p>
          <p className="text-[11px] text-neutral-400">Podium &amp; VIP Lounge</p>
        </div>

        <div className="p-5 rounded-xl bg-[#0f0c09] border border-white/10 space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Partnership Desk</p>
          <p className="text-lg font-black text-white font-graduate">
            Dedicated Manager
          </p>
          <p className="text-[11px] text-neutral-400">Direct Support</p>
        </div>
      </section>

      {/* Partner Deliverables Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#0f0c09] border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-base font-extrabold uppercase text-white font-graduate">
              {isSponsor && "Sponsorship Deliverables & Brand Assets"}
              {isVendor && "Stall Allocation & Setup Guidelines"}
              {isTourism && "Tourism Listing & Runner Guide Feature"}
            </h2>
            <span className="text-xs font-bold text-[#cca043]">Accredited</span>
          </div>

          {isSponsor && (
            <div className="space-y-3 text-sm text-neutral-300">
              <p>Your brand assets and logos have been assigned to official marathon collateral (race bibs, finish gantry, and press backdrop).</p>
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Logo Submissions:</span>
                  <span className="text-emerald-400 font-semibold">Vector SVG/EPS Approved</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">VIP Passes:</span>
                  <span className="text-white font-semibold">4 Passes (Finish Line VIP Enclosure)</span>
                </div>
              </div>
            </div>
          )}

          {isVendor && (
            <div className="space-y-3 text-sm text-neutral-300">
              <p>Your stall footprint is reserved at the Marathon Expo. Exhibitor setup commences 21 January 2027 at 10:00 AM.</p>
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Move-In Schedule:</span>
                  <span className="text-white font-semibold">21 Jan 2027, 10:00 AM - 08:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Power Allotment:</span>
                  <span className="text-white font-semibold">15A Dedicated Power Supply</span>
                </div>
              </div>
            </div>
          )}

          {isTourism && (
            <div className="space-y-3 text-sm text-neutral-300">
              <p>Your hospitality establishment is published on the official Rajgir Marathon accommodation portal for verified athletes.</p>
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Official Portal Status:</span>
                  <span className="text-emerald-400 font-semibold">Listed as Preferred Stay</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Bib Discount Code:</span>
                  <span className="text-[#cca043] font-semibold">RJGIR2027STAY</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Commercial Liaison Hotline */}
        <div className="p-6 rounded-2xl bg-[#0f0c09] border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-base font-extrabold uppercase text-white font-graduate">
              Commercial Liaison Desk
            </h2>
            <span className="text-xs font-bold text-neutral-400">Direct Support</span>
          </div>

          <div className="space-y-3 text-sm text-neutral-300">
            <p>Our corporate relations and venue operations team is available to assist with logistics, passes, and booth requirements.</p>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <FaPhoneAlt className="text-[#cca043] text-xs" />
                <span className="text-neutral-400">Commercial Desk:</span>
                <span className="text-white font-semibold">+91 612 222 7890</span>
              </div>
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-[#cca043] text-xs" />
                <span className="text-neutral-400">Partnership Email:</span>
                <span className="text-white font-semibold">partners@rajgirmarathon.com</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

