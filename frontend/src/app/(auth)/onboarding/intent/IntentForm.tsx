"use client";

import React, { useState } from "react";
import { selectRoleIntent } from "@/app/actions/auth";
import {
  FaRunning,
  FaHandsHelping,
  FaBullhorn,
  FaUsers,
  FaBuilding,
  FaGraduationCap,
  FaAward,
  FaStore,
  FaHotel,
  FaCheckCircle,
  FaArrowRight,
  FaShieldAlt,
} from "react-icons/fa";

interface RoleOption {
  id: string;
  title: string;
  category: "Individual" | "Group" | "Partner";
  desc: string;
  icon: React.ElementType;
  badge: string;
  badgeColor: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  // INDIVIDUAL
  {
    id: "RUNNER",
    title: "Marathon Runner",
    category: "Individual",
    desc: "Individual participant in 42.2K, 21.1K, 10K, or 5K categories.",
    icon: FaRunning,
    badge: "Instant Active",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "VOLUNTEER",
    title: "Event Volunteer",
    category: "Individual",
    desc: "Join race day crew for hydration, course marshaling, and athlete support.",
    icon: FaHandsHelping,
    badge: "Vetted Application",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  {
    id: "INFLUENCER",
    title: "Influencer / Creator",
    category: "Individual",
    desc: "Content creators, vloggers, and fitness ambassadors.",
    icon: FaBullhorn,
    badge: "Vetted Application",
    badgeColor: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  },

  // GROUP
  {
    id: "TEAM_CAPTAIN",
    title: "Team Captain",
    category: "Group",
    desc: "Running clubs, community running groups, and athletic teams.",
    icon: FaUsers,
    badge: "Instant Active",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "CORPORATE_MANAGER",
    title: "Corporate Company",
    category: "Group",
    desc: "HR managers registering company employees in bulk & CSR initiatives.",
    icon: FaBuilding,
    badge: "B2B Verification",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  {
    id: "SCHOOL_COORDINATOR",
    title: "School / College Group",
    category: "Group",
    desc: "Teachers and directors registering student contingents.",
    icon: FaGraduationCap,
    badge: "Institutional",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },

  // PARTNER
  {
    id: "SPONSOR",
    title: "Official Sponsor",
    category: "Partner",
    desc: "Brands seeking title, hydration, recovery, or apparel partnerships.",
    icon: FaAward,
    badge: "Commercial Proposal",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  {
    id: "VENDOR",
    title: "Expo & Food Stall",
    category: "Partner",
    desc: "Exhibitors selling running gear, sports nutrition, or local foods.",
    icon: FaStore,
    badge: "Stall Allotment",
    badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  {
    id: "TOURISM_PARTNER",
    title: "Tourism & Hotel Partner",
    category: "Partner",
    desc: "Rajgir hotels, resorts, transport fleets, and heritage tour guides.",
    icon: FaHotel,
    badge: "Local Listing",
    badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  },
];

export default function IntentForm() {
  const [selectedRole, setSelectedRole] = useState<string>("RUNNER");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ["Individual", "Group", "Partner"] as const;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#cca043] bg-[#cca043]/10 border border-[#cca043]/30 px-3 py-1 rounded-full">
          Step 2 of 2: Role Selection
        </span>
        <h1 className="text-2xl sm:text-4xl font-black uppercase text-white font-graduate mt-3">
          CHOOSE YOUR <span className="text-[#cca043]">PARTICIPATION PATH</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto mt-2 leading-relaxed">
          Select what you want to be on the Rajgir Marathon platform. Each account is permanently assigned to one role.
        </p>
      </div>

      <form action={selectRoleIntent} onSubmit={() => setIsSubmitting(true)} className="space-y-8">
        <input type="hidden" name="role" value={selectedRole} />

        {categories.map((cat) => {
          const items = ROLE_OPTIONS.filter((r) => r.category === cat);
          return (
            <div key={cat} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-[2px] w-4 bg-[#cca043]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white font-graduate">
                  {cat === "Individual" && "1. Individual Participation"}
                  {cat === "Group" && "2. Group & Institutional Delegations"}
                  {cat === "Partner" && "3. Commercial Partners & Expo"}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {items.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedRole === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedRole(opt.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between text-left relative overflow-hidden group ${
                        isSelected
                          ? "bg-[#cca043]/15 border-[#cca043] shadow-lg shadow-amber-950/30 ring-1 ring-[#cca043]"
                          : "bg-[#0d0a07] border-white/10 hover:border-white/20 hover:bg-[#120e0a]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-base ${
                              isSelected
                                ? "bg-[#cca043] text-black"
                                : "bg-white/5 border border-white/10 text-[#cca043] group-hover:scale-105 transition-transform"
                            }`}
                          >
                            <Icon />
                          </div>

                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${opt.badgeColor}`}>
                            {opt.badge}
                          </span>
                        </div>

                        <h4 className="text-sm font-extrabold text-white mb-1 group-hover:text-[#cca043] transition-colors">
                          {opt.title}
                        </h4>
                        <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                          {opt.desc}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-[11px] font-bold">
                        <span className={isSelected ? "text-[#cca043]" : "text-neutral-500"}>
                          {isSelected ? "Selected Role" : "Select this role"}
                        </span>
                        {isSelected && <FaCheckCircle className="text-xs text-[#cca043] ml-auto" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Action Button & Disclaimer */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-neutral-400 text-center sm:text-left">
            <FaShieldAlt className="text-[#cca043] text-sm shrink-0" />
            <span>Strict Policy: 1 User = 1 Permanent Role per email/mobile ID.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto py-3.5 px-8 rounded-full bg-gradient-to-r from-[#e51b24] via-[#dc2626] to-[#b91c1c] text-white font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-red-950/40 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <span>{isSubmitting ? "Proceeding..." : "Proceed to Registration"}</span>
            <FaArrowRight className="text-xs" />
          </button>
        </div>
      </form>
    </div>
  );
}
