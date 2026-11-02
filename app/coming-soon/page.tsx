"use client";

import React, { useState } from "react";
import Link from "next/link";
import ComingSoonHeader from "@/components/ComingSoonHeader";
import ComingSoonFooter from "@/components/ComingSoonFooter";
import {
  FaMapMarkerAlt,
  FaRunning,
  FaStopwatch,
  FaMedkit,
  FaTint,
  FaChevronRight,
  FaMedal,
  FaTshirt,
  FaCertificate,
  FaMusic,
  FaClipboardList,
  FaUserTie,
  FaStore,
  FaVideo,
  FaCamera,
  FaShareAlt,
  FaFlagCheckered,
  FaArrowRight,
  FaLandmark,
  FaUsers,
} from "react-icons/fa";
import { FaRoute, FaBowlFood } from "react-icons/fa6";

const eventHighlights = [
  {
    id: "heritage-route",
    title: "Heritage Route",
    icon: FaRoute,
    iconBg: "bg-gradient-to-br from-[#d49a37]/25 to-[#991b1b]/35 text-[#d49a37] border-[#cca043]/40",
    glowColor: "group-hover:shadow-[0_12px_32px_rgba(212,154,55,0.28)]",
    borderHover: "hover:border-[#cca043]",
  },
  {
    id: "tourism-culture",
    title: "Tourism & Culture",
    icon: FaLandmark,
    iconBg: "bg-gradient-to-br from-[#e51b24]/20 to-[#d49a37]/20 text-[#f87171] border-red-500/40",
    glowColor: "group-hover:shadow-[0_12px_32px_rgba(229,27,36,0.28)]",
    borderHover: "hover:border-red-500/80",
  },
  {
    id: "bihar-food-fest",
    title: "Bihar Food Fest",
    icon: FaBowlFood,
    iconBg: "bg-gradient-to-br from-amber-500/25 to-orange-600/30 text-amber-400 border-amber-500/40",
    glowColor: "group-hover:shadow-[0_12px_32px_rgba(245,158,11,0.28)]",
    borderHover: "hover:border-amber-400",
  },
  {
    id: "music-entertainment",
    title: "Music & Entertainment",
    icon: FaMusic,
    iconBg: "bg-gradient-to-br from-rose-500/20 to-purple-600/25 text-rose-400 border-rose-500/40",
    glowColor: "group-hover:shadow-[0_12px_32px_rgba(244,63,94,0.28)]",
    borderHover: "hover:border-rose-400",
  },
  {
    id: "community-engagement",
    title: "Community Engagement",
    icon: FaUsers,
    iconBg: "bg-gradient-to-br from-emerald-500/20 to-teal-600/25 text-emerald-400 border-emerald-500/40",
    glowColor: "group-hover:shadow-[0_12px_32px_rgba(16,185,129,0.28)]",
    borderHover: "hover:border-emerald-400",
  },
];

export default function ComingSoonPage() {
  const [selectedDistance, setSelectedDistance] = useState("42.2");

  return (
    <div
      style={{ fontFamily: "'Inter','Segoe UI',sans-serif", background: "#ffffff" }}
      className="relative min-h-screen w-full overflow-x-hidden flex flex-col"
    >
      {/* NAVBAR COMPONENT */}
      <ComingSoonHeader isAbsolute={true} />

      {/* HERO SECTION */}
      <section
        id="home"
        className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden pt-28 sm:pt-32 lg:pt-36 pb-6 sm:pb-8"
      >
        {/* Desktop background image */}
        <div className="absolute inset-0 hidden sm:block">
          <img
            src="/images/desktopHero.png"
            alt="Rajgir Marathon Hero Desktop"
            className="w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(10,5,3,0.92) 0%, rgba(10,5,3,0.78) 42%, rgba(10,5,3,0.2) 75%, rgba(10,5,3,0.45) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.15) 60%, rgba(10,5,3,0.92) 100%)",
            }}
          />
        </div>

        {/* Mobile background image */}
        <div className="absolute inset-0 block sm:hidden">
          <img
            src="/images/mobileHero.png"
            alt="Rajgir Marathon Hero Mobile"
            className="w-full h-full object-cover object-top"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(10,5,3,0.88) 0%, rgba(10,5,3,0.72) 45%, rgba(10,5,3,0.95) 100%)",
            }}
          />
        </div>

        {/* TOP HERO CONTENT: 2-COLUMN SPLIT */}
        <div className="relative z-10 w-full px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 flex-1 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8 pt-4 sm:pt-6">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col items-start text-left max-w-2xl xl:max-w-3xl">
            <h1 className="sr-only">Rajgir Marathon — Run Through History</h1>

            <div className="w-full max-w-[420px] sm:max-w-[400px] md:max-w-[480px] lg:max-w-[540px] xl:max-w-[600px] mb-2 sm:mb-3">
              <img
                src="/images/rajgir_marathon_heading.png"
                alt="Rajgir Marathon - Run Through History"
                className="w-full h-auto object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.95)] filter select-none"
              />
            </div>

            <div className="my-1 sm:my-2">
              <img
                src="/images/coming_soon_brush.png"
                alt="Coming Soon"
                className="w-64 sm:w-80 md:w-96 lg:w-[410px] xl:w-[450px] h-auto object-contain"
              />
            </div>

            <div className="flex items-center gap-2.5 mt-2 text-white font-extrabold text-xs sm:text-sm md:text-base tracking-[0.16em] uppercase">
              <FaMapMarkerAlt className="text-[#e51b24] text-base sm:text-lg shrink-0" />
              <span className="text-white">RAJGIR, BIHAR, INDIA</span>
              <span className="text-white/40 font-normal">|</span>
              <span className="text-white">2027</span>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full lg:w-auto flex justify-center lg:justify-end self-center lg:self-end pb-4 lg:pb-8 lg:pr-4">
            <img
              src="/images/one_run_many_stories.png"
              alt="One Run. Many Stories. Infinite Memories."
              className="w-60 sm:w-72 md:w-80 lg:w-[340px] xl:w-[400px] h-auto object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.95)]"
            />
          </div>
        </div>

        {/* BOTTOM HERO SECTION: 3 ACTION PILLARS + 1 HERITAGE BANNER */}
        <div className="relative z-10 w-full px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 mt-8 lg:mt-10 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* 1: REGISTER AS RUNNER */}
            <Link
              href="/contact?tab=runner"
              className="flex items-center justify-between px-5 py-3.5 rounded-xl border border-red-400/40 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-red-900/50 group cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #e51b24 0%, #b7121b 100%)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <img
                    src="/images/icon_runner_card.png"
                    alt="Runner Icon"
                    className="w-7 h-7 object-contain drop-shadow"
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-white/85 uppercase">
                    REGISTER AS
                  </span>
                  <span className="text-sm sm:text-base font-black tracking-wider uppercase text-white">
                    RUNNER
                  </span>
                </div>
              </div>
              <FaChevronRight className="text-white/80 group-hover:translate-x-1 transition-transform text-sm" />
            </Link>

            {/* 2: REGISTER AS VOLUNTEER */}
            <Link
              href="/contact?tab=volunteer"
              className="flex items-center justify-between px-5 py-3.5 rounded-xl border border-amber-300/40 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-amber-900/50 group cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #d49a37 0%, #a67420 100%)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <img
                    src="/images/icon_volunteer_card.png"
                    alt="Volunteer Icon"
                    className="w-8 h-7 object-contain drop-shadow"
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-white/85 uppercase">
                    REGISTER AS
                  </span>
                  <span className="text-sm sm:text-base font-black tracking-wider uppercase text-white">
                    VOLUNTEER
                  </span>
                </div>
              </div>
              <FaChevronRight className="text-white/80 group-hover:translate-x-1 transition-transform text-sm" />
            </Link>

            {/* 3: BECOME A SPONSOR */}
            <Link
              href="/contact?tab=sponsor"
              className="flex items-center justify-between px-5 py-3.5 rounded-xl border border-[#d49a37]/60 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-[#d49a37] group cursor-pointer"
              style={{
                background: "rgba(18, 16, 15, 0.88)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#d49a37]/15 flex items-center justify-center shrink-0">
                  <img
                    src="/images/icon_sponsor_card.png"
                    alt="Sponsor Icon"
                    className="w-8 h-7 object-contain drop-shadow"
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-[#e5a93c] uppercase">
                    BECOME A
                  </span>
                  <span className="text-sm sm:text-base font-black tracking-wider uppercase text-white">
                    SPONSOR
                  </span>
                </div>
              </div>
              <FaChevronRight className="text-white/80 group-hover:translate-x-1 transition-transform text-sm" />
            </Link>

            {/* 4: HERITAGE NATURE BANNER */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-[#d49a37]/45 text-white backdrop-blur-md"
              style={{
                background: "rgba(18, 16, 15, 0.8)",
              }}
            >
              <div className="w-10 h-10 rounded-lg bg-[#d49a37]/15 flex items-center justify-center shrink-0">
                <img
                  src="/images/icon_heritage_card.png"
                  alt="Heritage Pagoda Icon"
                  className="w-9 h-9 object-contain drop-shadow-[0_2px_8px_rgba(212,154,55,0.4)]"
                />
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-white/95 leading-snug text-left">
                EXPERIENCE THE PERFECT BLEND OF HERITAGE, NATURE & SPIRITUALITY
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 FEATURE BADGES STRIP */}
      <section
        id="feature-badges"
        className="relative z-20 w-full border-t border-b border-[#cca043] py-4 sm:py-5 px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20"
        style={{
          background: "linear-gradient(180deg, #181411 0%, #110e0c 100%)",
        }}
      >
        <div className="w-full max-w-sm sm:max-w-xl lg:max-w-none mx-auto grid grid-cols-2 lg:flex lg:flex-row lg:items-center lg:justify-between gap-x-4 sm:gap-x-8 gap-y-5 lg:gap-y-0">
          {[
            {
              img: "/images/badge_heritage.png",
              alt: "Ancient Heritage Route",
              line1: "ANCIENT",
              line2: "HERITAGE ROUTE",
            },
            {
              img: "/images/badge_race_mgmt.png",
              alt: "Professional Race Management",
              line1: "PROFESSIONAL",
              line2: "RACE MANAGEMENT",
            },
            {
              img: "/images/badge_rfid.png",
              alt: "RFID Timing",
              line1: "RFID",
              line2: "TIMING",
            },
            {
              img: "/images/badge_medical.png",
              alt: "Medical Support",
              line1: "MEDICAL",
              line2: "SUPPORT",
            },
            {
              img: "/images/badge_hydration.png",
              alt: "Hydration Stations",
              line1: "HYDRATION",
              line2: "STATIONS",
            },
          ].map((badge, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <div className="hidden lg:block w-[1px] h-7 lg:h-8 bg-[#cca043]/70 shrink-0" />
              )}
              <div className="flex items-center gap-2.5 sm:gap-3 justify-start">
                <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
                  <img
                    src={badge.img}
                    alt={badge.alt}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex flex-col text-left leading-[1.15]">
                  <span className="text-[10px] sm:text-[11px] lg:text-[12px] font-extrabold uppercase tracking-wider text-white">
                    {badge.line1}
                  </span>
                  <span className="text-[10px] sm:text-[11px] lg:text-[12px] font-extrabold uppercase tracking-wider text-white">
                    {badge.line2}
                  </span>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* DUAL CARDS SECTION: BECOME A RUNNER & JOIN TEAM RAJGIR */}
      <section
        id="participate-cards"
        className="relative z-20 w-full py-10 sm:py-14 lg:py-16 px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20"
        style={{
          background: "linear-gradient(180deg, #110e0c 0%, #0d0a08 50%, #0d0a08 100%)",
        }}
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-10 items-stretch">
          
          {/* CARD 1: BECOME A RUNNER */}
          <div className="relative w-full rounded-2xl sm:rounded-3xl border-[2.5px] border-[#b91c1c] flex flex-col justify-between bg-white shadow-2xl overflow-hidden">
            <div
              className="relative w-full p-5 sm:p-7 lg:p-8 pb-0 sm:pb-0 lg:pb-0 flex flex-col justify-between overflow-hidden"
              style={{ background: "#faf4ea", paddingBottom: 0 }}
            >
              <img
                src="/images/runner_athlete.png"
                alt="Runner"
                className="sm:hidden absolute right-0 bottom-0 w-auto max-h-[90%] max-w-[50%] object-contain object-bottom object-right select-none pointer-events-none z-0 block align-bottom"
              />

              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end flex-1 w-full">
                <div className="relative z-10 sm:col-span-7 flex flex-col items-start text-left self-start">
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-neutral-900">
                    BECOME A
                  </span>
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#b91c1c] tracking-tight leading-none my-1">
                    RUNNER
                  </h2>
                  
                  <div className="flex items-center gap-2 my-2 text-[#b91c1c] font-black text-xs sm:text-[13px] tracking-[0.14em] uppercase">
                    <span className="w-4 h-[2px] bg-[#b91c1c]" />
                    <span className="text-neutral-900 font-extrabold">CHOOSE YOUR DISTANCE</span>
                    <span className="w-4 h-[2px] bg-[#b91c1c]" />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 pb-1 sm:pb-4">
                    {[
                      { dist: "42.2", unit: "KM", label: "" },
                      { dist: "21.1", unit: "KM", label: "" },
                      { dist: "10", unit: "KM", label: "" },
                      { dist: "5", unit: "KM", label: "" },
                      { dist: "3", unit: "KM", label: "FUN RUN" },
                    ].map((d) => {
                      const isSelected = selectedDistance === d.dist;
                      return (
                        <button
                          key={d.dist}
                          type="button"
                          onClick={() => setSelectedDistance(d.dist)}
                          className={`w-11 sm:w-12 h-14 sm:h-16 rounded-lg flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? "bg-[#b91c1c] text-white shadow-md shadow-red-900/40 scale-105 border border-red-400"
                              : "bg-black text-white hover:bg-neutral-800 border border-neutral-800"
                          }`}
                        >
                          <span className="text-sm sm:text-base font-black leading-tight">
                            {d.dist}
                          </span>
                          <span className="text-[9px] font-extrabold uppercase tracking-wider leading-none mt-0.5">
                            {d.unit}
                          </span>
                          {d.label && (
                            <span className="text-[6.5px] font-bold tracking-tighter text-white/80 leading-none mt-0.5">
                              {d.label}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="hidden sm:flex sm:col-span-5 relative items-end justify-center sm:justify-end self-end p-0 m-0">
                  <img
                    src="/images/runner_athlete.png"
                    alt="Become a Runner - Athlete Sprinting"
                    className="w-full max-w-[260px] sm:max-w-none h-auto max-h-[190px] sm:max-h-[220px] lg:max-h-[240px] object-contain object-bottom select-none pointer-events-none block align-bottom"
                  />
                </div>
              </div>
            </div>

            <div className="w-full p-5 sm:p-7 lg:p-8 pt-5 sm:pt-6 bg-white flex flex-col justify-between flex-1">
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 sm:gap-y-3.5 mb-5 sm:mb-6">
                {[
                  { icon: FaMedal, text: "Finisher Medal" },
                  { icon: FaMapMarkerAlt, text: "Live Tracking" },
                  { icon: FaTshirt, text: "Premium T-Shirt" },
                  { icon: FaStopwatch, text: "Professional Timing" },
                  { icon: FaCertificate, text: "Digital Certificate" },
                  { icon: FaMusic, text: "Entertainment & More" },
                ].map((perk, idx) => {
                  const Icon = perk.icon;
                  return (
                    <div key={idx} className="flex items-center gap-2.5 sm:gap-3 text-left">
                      <Icon className="text-[#b91c1c] text-base sm:text-lg shrink-0" />
                      <span className="text-xs sm:text-sm font-bold text-neutral-900 tracking-tight leading-tight">
                        {perk.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Link
                href={`/contact?tab=runner${selectedDistance ? `&distance=${selectedDistance}` : ""}`}
                className="w-full py-3 sm:py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#991b1b] via-[#b91c1c] to-[#dc2626] text-white font-extrabold tracking-widest text-xs sm:text-sm uppercase flex items-center justify-center gap-2 shadow-lg shadow-red-950/25 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>PRE-REGISTER NOW</span>
                <FaArrowRight className="text-xs sm:text-sm" />
              </Link>
            </div>
          </div>

          {/* CARD 2: JOIN TEAM RAJGIR */}
          <div className="relative w-full rounded-2xl sm:rounded-3xl border-[2.5px] border-[#d49a37] flex flex-col justify-between bg-white shadow-2xl overflow-hidden">
            <div
              className="relative w-full p-5 sm:p-7 lg:p-8 pb-0 sm:pb-0 lg:pb-0 flex flex-col justify-between overflow-hidden"
              style={{ background: "#faf4ea", paddingBottom: 0 }}
            >
              <img
                src="/images/volunteer_team_v2.png"
                alt="Volunteer Crew"
                className="sm:hidden absolute right-0 bottom-0 w-auto max-h-[92%] max-w-[54%] object-contain object-bottom object-right select-none pointer-events-none z-0 block align-bottom"
              />

              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end flex-1 w-full">
                <div className="relative z-10 sm:col-span-7 flex flex-col items-start text-left self-start pb-1 sm:pb-4">
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-neutral-900">
                    JOIN TEAM
                  </span>
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#d49a37] tracking-tight leading-none my-1">
                    RAJGIR
                  </h2>
                  
                  <p className="font-extrabold text-neutral-900 text-xs sm:text-sm tracking-[0.08em] uppercase mt-2.5 leading-snug">
                    BE THE HEART OF <br /> THE MARATHON
                  </p>
                </div>

                <div className="hidden sm:flex sm:col-span-5 relative items-end justify-center sm:justify-end self-end p-0 m-0">
                  <img
                    src="/images/volunteer_team_v2.png"
                    alt="Join Team Rajgir - Volunteer Crew"
                    className="w-full max-w-[280px] sm:max-w-none h-auto max-h-[190px] sm:max-h-[220px] lg:max-h-[245px] object-contain object-bottom select-none pointer-events-none block align-bottom"
                  />
                </div>
              </div>
            </div>

            <div className="w-full p-5 sm:p-7 lg:p-8 pt-5 sm:pt-6 bg-white flex flex-col justify-between flex-1">
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:gap-y-2.5 mb-5 sm:mb-6">
                {[
                  { icon: FaRunning, text: "Route Marshal" },
                  { icon: FaStore, text: "Expo & Village" },
                  { icon: FaClipboardList, text: "Registration Desk" },
                  { icon: FaVideo, text: "Media Team" },
                  { icon: FaTint, text: "Hydration Station" },
                  { icon: FaCamera, text: "Photography" },
                  { icon: FaMedkit, text: "Medical Support" },
                  { icon: FaShareAlt, text: "Social Media" },
                  { icon: FaUserTie, text: "VIP Management" },
                  { icon: FaFlagCheckered, text: "Finish Line Operations" },
                ].map((role, idx) => {
                  const Icon = role.icon;
                  return (
                    <div key={idx} className="flex items-center gap-2.5 sm:gap-3 text-left">
                      <Icon className="text-[#d49a37] text-sm sm:text-base shrink-0" />
                      <span className="text-xs sm:text-[13px] font-bold text-neutral-900 tracking-tight leading-tight">
                        {role.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Link
                href="/contact?tab=volunteer"
                className="w-full py-3 sm:py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#b47a1f] via-[#d49a37] to-[#e0a845] text-white font-extrabold tracking-widest text-xs sm:text-sm uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-950/25 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>BECOME A VOLUNTEER</span>
                <FaArrowRight className="text-xs sm:text-sm" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4: WHY PARTICIPATE? (8 Feature Badges Strip) */}
      <section
        id="why-participate"
        className="relative z-20 w-full py-8 sm:py-12 lg:py-14 px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 border-b border-[#cca043]/35"
        style={{
          background: "linear-gradient(180deg, #0d0a08 0%, #110e0c 50%, #0d0a08 100%)",
        }}
      >
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8 sm:mb-12">
          <span className="flex-1 h-[1.5px] bg-[#991b1b] max-w-[60px] sm:max-w-[160px] md:max-w-[240px]" />
          <h2 className="text-sm sm:text-base md:text-lg font-black tracking-[0.2em] sm:tracking-[0.25em] text-white uppercase px-2 text-center whitespace-nowrap">
            WHY PARTICIPATE?
          </h2>
          <span className="flex-1 h-[1.5px] bg-[#991b1b] max-w-[60px] sm:max-w-[160px] md:max-w-[240px]" />
        </div>

        <div className="grid grid-cols-4 lg:flex lg:items-center lg:justify-between gap-y-7 sm:gap-y-9 gap-x-2 sm:gap-x-4">
          {[
            {
              title: "SCENIC\nROUTE",
              image: "/images/why_scenic_route.png",
              alt: "Scenic Route",
            },
            {
              title: "WORLD CLASS\nEVENT",
              image: "/images/why_world_class.png",
              alt: "World Class Event",
            },
            {
              title: "FINISHER\nMEDAL",
              image: "/images/why_finisher_medal.png",
              alt: "Finisher Medal",
            },
            {
              title: "PREMIUM\nT-SHIRT",
              image: "/images/why_premium_tshirt.png",
              alt: "Premium T-Shirt",
            },
            {
              title: "RFID\nTIMING",
              image: "/images/badge_rfid.png",
              alt: "RFID Timing",
            },
            {
              title: "MEDICAL\nSUPPORT",
              image: "/images/badge_medical.png",
              alt: "Medical Support",
            },
            {
              title: "FAMILY\nEXPERIENCE",
              image: "/images/why_family_experience.png",
              alt: "Family Experience",
            },
            {
              title: "LOCAL TOURISM\nEXPERIENCE",
              image: "/images/why_tourism_camera.png",
              alt: "Local Tourism Experience",
            },
          ].map((item, idx, arr) => (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center justify-start text-center group cursor-pointer lg:flex-1 px-1">
                <div className="h-10 sm:h-12 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="h-8 sm:h-10 md:h-11 w-auto max-w-[56px] object-contain select-none pointer-events-none"
                  />
                </div>

                <p className="text-[9.5px] sm:text-[11px] md:text-xs font-black uppercase text-center text-white tracking-wider leading-tight whitespace-pre-line mt-2 sm:mt-3 group-hover:text-[#cca043] transition-colors">
                  {item.title}
                </p>
              </div>

              {idx < arr.length - 1 && (
                <div className="hidden lg:block w-[1px] h-10 bg-[#cca043]/20 self-center shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* SECTION 5: EVENT HIGHLIGHTS */}
      <section
        id="event-highlights"
        className="relative z-20 w-full py-12 sm:py-16 lg:py-20 px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0d0a08 0%, #15100c 50%, #0d0a08 100%)",
        }}
      >
        <span id="experience" className="absolute -top-24" />
        <span id="explore" className="absolute -top-24" />

        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#cca043]/45 to-transparent" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[320px] bg-[#cca043]/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[320px] bg-[#991b1b]/8 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight font-graduate leading-tight">
            EVENT <span className="text-[#cca043]">HIGHLIGHTS</span>
          </h2>

          <div className="flex items-center justify-center gap-3 my-3 sm:my-4 mb-8 sm:mb-10">
            <span className="w-10 sm:w-16 h-[2px] bg-gradient-to-r from-transparent to-[#e51b24]" />
            <span className="w-2.5 h-2.5 rotate-45 border border-[#cca043] bg-[#b91c1c] shadow-sm shadow-red-900/50" />
            <span className="w-10 sm:w-16 h-[2px] bg-gradient-to-l from-transparent to-[#e51b24]" />
          </div>

          <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-3.5 xl:gap-5 items-stretch">
            {eventHighlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`group relative rounded-2xl bg-[#14100c]/90 hover:bg-[#1b1510] border border-white/10 ${item.borderHover} transition-all duration-300 py-6 px-3.5 sm:py-8 sm:px-5 flex flex-col items-center justify-center text-center shadow-xl ${item.glowColor} hover:-translate-y-2 cursor-pointer overflow-hidden ${
                    idx === 4 ? "col-span-2 sm:col-span-1 lg:col-span-1" : ""
                  }`}
                >
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#cca043]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                  <div className="mb-3.5 sm:mb-4 relative z-10">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border flex items-center justify-center text-2xl sm:text-3xl transition-all duration-300 group-hover:scale-110 shadow-lg shrink-0 ${item.iconBg}`}
                    >
                      <Icon />
                    </div>
                  </div>

                  <h3 className="relative z-10 text-xs sm:text-sm lg:text-[14px] xl:text-[15px] font-black uppercase text-white tracking-wide leading-snug group-hover:text-[#cca043] transition-colors font-graduate">
                    {item.title}
                  </h3>

                  <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#e51b24] via-[#cca043] to-[#e51b24] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#cca043]/30 to-transparent" />
      </section>

      {/* FOOTER */}
      <ComingSoonFooter />
    </div>
  );
}
