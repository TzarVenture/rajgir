"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaRunning,
  FaMedal,
  FaMapMarkedAlt,
  FaTrophy,
  FaClock,
  FaShieldAlt,
  FaSignOutAlt,
  FaEye,
  FaArrowRight,
  FaHeartbeat,
  FaTint,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaAward,
} from "react-icons/fa";
import { FaRoute } from "react-icons/fa6";

const raceCategories = [
  {
    distance: "42.2 KM",
    name: "Full Heritage Marathon",
    badge: "Flagship Race",
    badgeColor: "bg-red-600 text-white",
    description: "The complete historic circuit through Rajgir's five sacred hills and ancient monuments.",
    timeLimit: "6 Hours",
    elevation: "Moderate / Rolling Hills",
    perks: ["RFID Bib Timing Chip", "Official Dry-Fit Jersey", "Heavy Finishers Medal", "Hot Recovery Buffet", "Verified E-Certificate"],
    accent: "border-red-500/40 hover:border-red-500",
  },
  {
    distance: "21.1 KM",
    name: "Half Marathon",
    badge: "Popular Choice",
    badgeColor: "bg-amber-500 text-black",
    description: "A fast, scenic route connecting Vishwa Shanti Stupa and the ancient Cyclopean Wall.",
    timeLimit: "3.5 Hours",
    elevation: "Gentle Incline",
    perks: ["RFID Bib Timing Chip", "Official Dry-Fit Jersey", "Finishers Medal", "Hydration Stations", "Verified E-Certificate"],
    accent: "border-amber-500/40 hover:border-amber-500",
  },
  {
    distance: "10 KM",
    name: "Rajgir Hill Challenge",
    badge: "Timed Run",
    badgeColor: "bg-blue-600 text-white",
    description: "A high-energy competitive run through pristine forested trails and heritage sites.",
    timeLimit: "100 Mins",
    elevation: "Scenic Trails",
    perks: ["RFID Bib Timing Chip", "Finisher Medal", "Dry-Fit Running Tee", "Post-Race Refreshments"],
    accent: "border-blue-500/40 hover:border-blue-500",
  },
  {
    distance: "5 KM",
    name: "Heritage Dream Run",
    badge: "Non-Timed",
    badgeColor: "bg-emerald-600 text-white",
    description: "A celebration of fitness, culture, and community for runners of all fitness levels.",
    timeLimit: "60 Mins",
    elevation: "Flat Scenic Circuit",
    perks: ["Finisher Souvenir Medal", "Event T-Shirt", "Participation Certificate", "Heritage Breakfast"],
    accent: "border-emerald-500/40 hover:border-emerald-500",
  },
];

const heritageHighlights = [
  {
    title: "Vishwa Shanti Stupa",
    tag: "Ratnagiri Hill",
    description: "White marble Peace Pagoda with panoramic vistas over Rajgir valley.",
  },
  {
    title: "Cyclopean Wall",
    tag: "Ancient Wonder",
    description: "Pre-Mauryan 40km stone masonry fortification dating back over 2,500 years.",
  },
  {
    title: "Venuvana & Karanda Tank",
    tag: "Sacred Grove",
    description: "The historical bamboo grove gifted by King Bimbisara to Lord Buddha.",
  },
  {
    title: "Griddhakuta (Vulture Peak)",
    tag: "Spiritual Landmark",
    description: "Revered hillside retreat known for timeless teachings of compassion.",
  },
];

export default function RealMarathonHomePage() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/preview", { method: "DELETE" });
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070503] text-white flex flex-col font-sans selection:bg-[#d49a37] selection:text-black">
      {/* 1. STAKEHOLDER PREVIEW MODE TOP BANNER */}
      <div className="w-full bg-gradient-to-r from-neutral-900 via-[#18120a] to-neutral-900 border-b border-[#cca043]/30 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold uppercase tracking-wider text-[#d49a37]">
            Stakeholder Preview Environment
          </span>
          <span className="hidden md:inline text-neutral-400">|</span>
          <span className="hidden md:inline text-neutral-300">
            Public visitors see the Coming Soon page at this URL
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/coming-soon"
            className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors flex items-center gap-1.5"
          >
            <FaEye className="text-[10px]" />
            <span>View Public Coming Soon</span>
          </Link>
          <Link
            href="/wip"
            className="px-2.5 py-1 rounded bg-[#cca043]/20 hover:bg-[#cca043]/30 text-[#e0a845] font-semibold transition-colors"
          >
            Portal Modules Roadmap
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-2.5 py-1 rounded bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <FaSignOutAlt className="text-[10px]" />
            <span>{loggingOut ? "Exiting..." : "Lock & Exit"}</span>
          </button>
        </div>
      </div>

      {/* 2. OFFICIAL MARATHON HEADER NAVIGATION */}
      <header className="w-full border-b border-white/10 bg-[#0c0906]/90 backdrop-blur-md sticky top-9 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/images/mainLogo.png"
              alt="Rajgir Marathon Logo"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow"
            />
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-base sm:text-lg tracking-wider text-white font-graduate">
                RAJGIR MARATHON
              </span>
              <span className="text-[10px] tracking-widest uppercase text-[#cca043] font-bold">
                Run Through History • 2027
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-neutral-300">
            <Link href="/" className="text-[#cca043] transition-colors">
              Home
            </Link>
            <a href="#categories" className="hover:text-white transition-colors">
              Races
            </a>
            <a href="#route" className="hover:text-white transition-colors">
              Heritage Route
            </a>
            <a href="#perks" className="hover:text-white transition-colors">
              Perks & Amenities
            </a>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact & Support
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/register/runner"
              className="py-2.5 px-5 rounded-full bg-gradient-to-r from-[#e51b24] to-[#b91c1c] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-900/30 hover:brightness-110 active:scale-95 transition-all"
            >
              Register Now
            </Link>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative w-full overflow-hidden pt-16 pb-24 border-b border-white/10">
        <div className="absolute inset-0 bg-radial from-[#d49a37]/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#cca043]/40 bg-[#cca043]/10 text-[#d49a37] text-xs font-bold uppercase tracking-widest mb-6">
            <FaCalendarAlt />
            <span>November 2027 • Rajgir, Nalanda, Bihar</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white max-w-4xl mx-auto leading-tight mb-6 font-graduate">
            RUN THROUGH 2,500 YEARS OF{" "}
            <span className="bg-gradient-to-r from-[#d49a37] via-[#f59e0b] to-[#e51b24] bg-clip-text text-transparent">
              LIVING HISTORY
            </span>
          </h1>

          <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-8">
            India’s most celebrated cultural marathon through the ancient capital of Magadha.
            Traverse rolling valley roads, forested hill trails, and timeless sacred monuments.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#categories"
              className="py-3.5 px-8 rounded-full bg-gradient-to-r from-[#d49a37] via-[#e0a845] to-[#cca043] text-black font-extrabold text-xs uppercase tracking-wider shadow-xl hover:brightness-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Explore Race Categories</span>
              <FaArrowRight className="text-[11px]" />
            </a>
            <Link
              href="/register/runner"
              className="py-3.5 px-8 rounded-full bg-white/10 border border-white/20 hover:bg-white/15 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
            >
              Early Bird Registration
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-14 pt-10 border-t border-white/10">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#d49a37]">42.2 KM</div>
              <div className="text-xs uppercase tracking-wider text-neutral-400 mt-1">Full Marathon</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white">5,000+</div>
              <div className="text-xs uppercase tracking-wider text-neutral-400 mt-1">Expected Runners</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#e51b24]">₹15 Lakh+</div>
              <div className="text-xs uppercase tracking-wider text-neutral-400 mt-1">Total Prize Purse</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white">AIMS Certified</div>
              <div className="text-xs uppercase tracking-wider text-neutral-400 mt-1">Standard Timing</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. RACE CATEGORIES */}
      <section id="categories" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-[#d49a37]">
            Choose Your Challenge
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight mt-1 font-graduate">
            Official Race Categories
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto mt-2">
            Categories designed for professional marathoners, amateur athletes, and passionate fitness enthusiasts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {raceCategories.map((cat, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border bg-[#0d0906] p-6 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 ${cat.accent}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${cat.badgeColor}`}>
                    {cat.badge}
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-400">{cat.timeLimit}</span>
                </div>

                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-graduate mb-1">
                  {cat.distance}
                </div>
                <h3 className="text-sm font-bold text-[#d49a37] mb-2">{cat.name}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-5">{cat.description}</p>

                <div className="border-t border-white/10 pt-4 mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                    Included Benefits:
                  </span>
                  <ul className="space-y-1.5">
                    {cat.perks.map((p, pIdx) => (
                      <li key={pIdx} className="text-xs text-neutral-300 flex items-center gap-2">
                        <FaCheckCircle className="text-[10px] text-[#d49a37] shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link
                href={`/register/runner?distance=${encodeURIComponent(cat.distance)}`}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 group-hover:bg-[#d49a37] group-hover:text-black text-white font-bold text-xs uppercase tracking-wider text-center border border-white/10 group-hover:border-[#d49a37] transition-all"
              >
                Select {cat.distance}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HERITAGE ROUTE HIGHLIGHTS */}
      <section id="route" className="py-20 border-t border-white/10 bg-[#0a0705]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#cca043]">
              The Sacred Trail
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight mt-1 font-graduate">
              Historic Circuit Landmarks
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {heritageHighlights.map((site, sIdx) => (
              <div
                key={sIdx}
                className="rounded-xl border border-white/10 bg-[#0f0c08] p-5 hover:border-[#cca043]/50 transition-colors"
              >
                <span className="text-[10px] font-mono font-bold text-[#d49a37] uppercase tracking-wider block mb-1">
                  {site.tag}
                </span>
                <h3 className="text-base font-bold text-white mb-2">{site.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{site.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PERKS & AMENITIES */}
      <section id="perks" className="py-20 border-t border-white/10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-[#e51b24]">
            World-Class Experience
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight mt-1 font-graduate">
            Runner Safety & Amenities
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-xl border border-white/10 bg-[#0e0a07] p-6 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center text-xl mb-4">
              <FaHeartbeat />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Medical Stations</h3>
            <p className="text-xs text-neutral-400">Paramedic teams, ambulances, and first-aid response every 1.5 km.</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0e0a07] p-6 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xl mb-4">
              <FaTint />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Electrolytes & Water</h3>
            <p className="text-xs text-neutral-400">Abundant hydration points with mineral water, electrolytes, and energy fruits.</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0e0a07] p-6 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#d49a37] flex items-center justify-center text-xl mb-4">
              <FaClock />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">RFID Precision Timing</h3>
            <p className="text-xs text-neutral-400">Accredited electronic timing bibs with split notifications & live updates.</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0e0a07] p-6 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xl mb-4">
              <FaAward />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Finisher Accolades</h3>
            <p className="text-xs text-neutral-400">Bespoke heavy alloy medal, verified digital certificate, and finisher gift.</p>
          </div>
        </div>
      </section>

      {/* 7. OFFICIAL FOOTER */}
      <footer className="mt-auto border-t border-white/10 bg-[#080604] py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-400">
          <div className="flex items-center gap-3">
            <img src="/images/mainLogo.png" alt="Rajgir Marathon" className="h-8 w-auto object-contain" />
            <span>© 2027 Rajgir Marathon. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact Us
            </Link>
            <Link href="/coming-soon" className="hover:text-[#d49a37] transition-colors">
              Coming Soon Page
            </Link>
            <Link href="/preview" className="hover:text-white transition-colors">
              Preview Access
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
