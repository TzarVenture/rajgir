"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaLock,
  FaCheckCircle,
  FaUserShield,
  FaRunning,
  FaHandsHelping,
  FaBuilding,
  FaStore,
  FaCompass,
  FaSignOutAlt,
} from "react-icons/fa";

export default function WipPreviewHome() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/preview", { method: "DELETE" });
    router.push("/");
    router.refresh();
  };

  const portalModules = [
    { title: "Runner Portal", path: "/portal/runner", icon: FaRunning, desc: "Registration, Digital Bib, Results & Certificates" },
    { title: "Volunteer Portal", path: "/portal/volunteer", icon: FaHandsHelping, desc: "Shift rosters, QR check-in & SOS alerts" },
    { title: "Institutional / B2B", path: "/portal/corporate", icon: FaBuilding, desc: "Corporate & School bulk roster uploads" },
    { title: "Expo & Vendors", path: "/portal/vendor", icon: FaStore, desc: "Interactive booth map & exhibitor passes" },
    { title: "Tourism & Hotels", path: "/portal/tourism", icon: FaCompass, desc: "Rajgir stay, transit & heritage packages" },
    { title: "Admin Command Center", path: "/portal/admin", icon: FaUserShield, desc: "Race day operations, RFID timing & finances" },
  ];

  return (
    <div
      style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}
      className="min-h-screen bg-[#080604] text-white flex flex-col"
    >
      {/* Top Bar */}
      <header className="w-full border-b border-[#cca043]/30 bg-[#0f0c09] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/images/rajgir_new_logo.png"
            alt="Rajgir Marathon"
            className="h-10 w-auto object-contain"
          />
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#d49a37]">
              STAKEHOLDER PREVIEW ENVIRONMENT
            </span>
            <span className="text-xs font-bold text-white">Rajgir Marathon Platform v1.0</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs font-bold text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-all"
          >
            View Coming Soon Live Page
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs font-bold text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FaSignOutAlt />
            <span>Lock & Exit</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 flex flex-col gap-8">
        {/* Banner */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center text-xl shrink-0">
              <FaCheckCircle />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-black uppercase text-white">Preview Session Active</h2>
              <p className="text-xs text-neutral-300">
                You are authenticated. The Coming Soon page remains active for public visitors, while you can inspect and build all internal pages here.
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono text-emerald-300 shrink-0">
            ENV: COMING_SOON=true
          </div>
        </div>

        {/* Modules Grid */}
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-[#d49a37] mb-4 text-left">
            Platform Modules Architecture (In-Progress)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {portalModules.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-[#0f0c09] p-5 text-left flex flex-col justify-between hover:border-[#cca043]/50 transition-all group"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-[#cca043]/15 border border-[#cca043]/30 text-[#d49a37] flex items-center justify-center text-lg mb-3">
                      <Icon />
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#cca043] transition-colors">
                      {mod.title}
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1">{mod.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-bold text-[#cca043]">
                    <span>Ready for Scaffolding</span>
                    <span>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

