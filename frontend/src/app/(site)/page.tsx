"use client";

import React, { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import PreviewBanner from "@/components/layout/PreviewBanner";
import { usePreviewMode } from "@/components/layout/PreviewContext";
import {
  FaRunning,
  FaMedal,
  FaTrophy,
  FaClock,
  FaShieldAlt,
  FaArrowRight,
  FaHeartbeat,
  FaTint,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaAward,
  FaUsers,
  FaHandsHelping,
  FaBuilding,
  FaGraduationCap,
  FaHandshake,
  FaStore,
  FaUtensils,
  FaChevronRight,
  FaCheck,
} from "react-icons/fa";
import { FaRoute } from "react-icons/fa6";

const raceCategories = [
  {
    distance: "42.2 KM",
    name: "Full Heritage Marathon",
    badge: "Flagship Race",
    badgeColor: "bg-[#E31B23] text-white",
    description:
      "The complete historic circuit through Rajgir's five sacred hills and ancient Magadha fortifications.",
    timeLimit: "6.0 Hours Cut-Off",
    elevation: "Rolling Valley & Hill Roads",
    perks: [
      "RFID Bib Timing Chip & Live SMS Splits",
      "Official Technical Dry-Fit Running Jersey",
      "Heavy Commemorative Alloy Finisher Medal",
      "Hot Regional & Protein Recovery Buffet",
      "Official Verified E-Certificate of Completion",
    ],
    borderAccent: "hover:border-[#E31B23]",
    buttonBg: "bg-[#E31B23] hover:bg-[#B5121B] text-white",
  },
  {
    distance: "21.1 KM",
    name: "Half Marathon",
    badge: "Most Popular",
    badgeColor: "bg-[#F5A623] text-neutral-900",
    description:
      "A fast, scenic route connecting Vishwa Shanti Stupa and the ancient 2,500-year Cyclopean Wall.",
    timeLimit: "3.5 Hours Cut-Off",
    elevation: "Gentle Incline Circuit",
    perks: [
      "RFID Bib Timing Chip with Split Mats",
      "Official Technical Dry-Fit Running Jersey",
      "Bespoke Stupa Finisher Medal",
      "Electrolyte & Energy Fruit Stations",
      "Official Verified Digital E-Certificate",
    ],
    borderAccent: "hover:border-[#F5A623]",
    buttonBg: "bg-[#111827] hover:bg-[#E31B23] text-white",
  },
  {
    distance: "10 KM",
    name: "Rajgir Hill Challenge",
    badge: "Timed Challenge",
    badgeColor: "bg-[#111827] text-white",
    description:
      "A high-energy competitive run through pristine forested trails and revered valley heritage sites.",
    timeLimit: "100 Minutes Cut-Off",
    elevation: "Scenic Forest Foothills",
    perks: [
      "RFID Bib Timing Chip & Finish Timing",
      "Exclusive Finisher Souvenir Medal",
      "Dry-Fit Technical Running Tee",
      "Route Hydration & Medical Support",
      "Verified Digital Participation E-Certificate",
    ],
    borderAccent: "hover:border-[#111827]",
    buttonBg: "bg-[#111827] hover:bg-[#E31B23] text-white",
  },
  {
    distance: "5 KM",
    name: "Heritage Dream Run",
    badge: "Community & Family",
    badgeColor: "bg-emerald-600 text-white",
    description:
      "A celebration of health, culture, and community for runners, youth, and families of all levels.",
    timeLimit: "60 Minutes",
    elevation: "Flat & Fast Scenic Circuit",
    perks: [
      "Commemorative Heritage Finisher Souvenir",
      "Official Rajgir Marathon Event T-Shirt",
      "Hydration & Energy Refreshments",
      "Post-Run Magadha Community Breakfast",
      "Official Digital Participation Certificate",
    ],
    borderAccent: "hover:border-emerald-600",
    buttonBg: "bg-[#111827] hover:bg-emerald-600 text-white",
  },
];

const personaPathways = [
  {
    icon: FaRunning,
    title: "Individual Runners",
    tagline: "42.2K • 21.1K • 10K • 5K",
    description:
      "Race through 2,500 years of living history with accredited RFID timing bibs and world-class hydration support.",
    badge: "Early Bird Open",
    href: "/register/runner",
    cta: "Register as Runner",
  },
  {
    icon: FaHandsHelping,
    title: "Volunteer Crew",
    tagline: "Heartbeat of the Event",
    description:
      "Join race day operations across hydration, route management, athlete recovery, and medal distribution.",
    badge: "Certificate & Kit",
    href: "/register/volunteer",
    cta: "Join Volunteer Crew",
  },
  {
    icon: FaUsers,
    title: "Clubs & Running Teams",
    tagline: "Compete as a Team",
    description:
      "Represent your running group, club, or athletics academy with dedicated team slots and group discounts.",
    badge: "Group Discounts",
    href: "/join",
    cta: "Register Running Club",
  },
  {
    icon: FaBuilding,
    title: "Corporate Delegations",
    tagline: "Workplace Wellness",
    description:
      "Foster team camaraderie and wellness through corporate marathon challenges and branded executive bibs.",
    badge: "Corporate Cup",
    href: "/contact?intent=corporate",
    cta: "Corporate Entries",
  },
  {
    icon: FaGraduationCap,
    title: "Schools & Universities",
    tagline: "Youth Athletics",
    description:
      "Inspire student athletes with collegiate packages, school participation cups, and feeder category medals.",
    badge: "Youth Program",
    href: "/contact?intent=schools",
    cta: "School Programs",
  },
  {
    icon: FaHandshake,
    title: "Sponsors & Partners",
    tagline: "Brand Showcase",
    description:
      "Connect your brand with thousands of athletes, tourists, and wellness leaders in Bihar's historic heartland.",
    badge: "Expo Stalls Open",
    href: "/join",
    cta: "Partner With Us",
  },
];

const heritageHighlights = [
  {
    title: "Vishwa Shanti Stupa",
    tag: "Peace Pagoda • Ratnagiri Hill",
    description:
      "A magnificent white marble monument atop Ratnagiri Hill, overlooking mist-clad valleys and reachable by the iconic aerial ropeway.",
    elevation: "400m Ascent",
  },
  {
    title: "Cyclopean Wall of Rajgir",
    tag: "Pre-Mauryan Wonder",
    description:
      "A massive 40-kilometer stone masonry fortification built over 2,500 years ago, standing as one of India's oldest surviving defense structures.",
    elevation: "Historic Trailside",
  },
  {
    title: "Venuvana Sacred Grove",
    tag: "King Bimbisara's Gift",
    description:
      "The peaceful bamboo grove gifted by Emperor Bimbisara to Lord Buddha, known for its serene lotus ponds and meditative stillness.",
    elevation: "Valley Level",
  },
  {
    title: "Griddhakuta (Vulture Peak)",
    tag: "Spiritual Landmark",
    description:
      "A sacred hillside retreat renowned for historic Buddhist discourses and breathtaking sunrise panoramas across Rajgir valley.",
    elevation: "Scenic Vista Point",
  },
];

const raceAmenities = [
  {
    icon: FaHeartbeat,
    color: "text-[#E31B23] bg-red-50 border-red-100",
    title: "Advanced Medical Response",
    description:
      "Equipped ambulances, mobile paramedical bike units, and medical aid tents every 1.5 km with on-site cardiac care.",
  },
  {
    icon: FaTint,
    color: "text-blue-600 bg-blue-50 border-blue-100",
    title: "Electrolytes & Hydration",
    description:
      "Abundant hydration points serving chilled mineral water, Enerzal isotonic drinks, bananas, and fast-energy glucose.",
  },
  {
    icon: FaClock,
    color: "text-[#C78A12] bg-amber-50 border-amber-100",
    title: "Accredited RFID Bib Timing",
    description:
      "Electronic split timing mats at key race checkpoints with instant SMS finish notifications and verified e-certificates.",
  },
  {
    icon: FaAward,
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    title: "Bespoke Finisher Medals",
    description:
      "High-relief cast alloy medals featuring the Vishwa Shanti Stupa icon and five hills crest, presented at the finish line.",
  },
  {
    icon: FaShieldAlt,
    color: "text-purple-600 bg-purple-50 border-purple-100",
    title: "Baggage & Security Lounges",
    description:
      "Secure RFID-monitored baggage holding areas, separate changing cabanas, and sanitized mobile rest facilities.",
  },
  {
    icon: FaUtensils,
    color: "text-orange-600 bg-orange-50 border-orange-100",
    title: "Heritage Recovery Breakfast",
    description:
      "Hot nutritious post-race breakfast featuring fresh fruits, Bihar's nutritious sattu energy shakes, and herbal tea.",
  },
];

const editorialStories = [
  {
    title: "Running Through 2,500 Years: The Magadha Marathon Circuit",
    category: "Heritage & Culture",
    readTime: "4 Min Read",
    date: "November 2026",
    summary:
      "How the ancient capital of Magadha transformed from an imperial fortification into India's premier cultural running destination.",
  },
  {
    title: "Pacing the Hills of Rajgir: Master Training Guide",
    category: "Training & Advice",
    readTime: "6 Min Read",
    date: "October 2026",
    summary:
      "Expert coaching techniques on tackling rolling elevations, breathing in morning fog, and maintaining steady race split rhythms.",
  },
  {
    title: "Voices from the Trail: Meet the Rajgir Volunteer Crew",
    category: "Community",
    readTime: "3 Min Read",
    date: "September 2026",
    summary:
      "Over 400 local youth and college students undergo emergency logistics and sports event management training to power race day.",
  },
];

export default function RealMarathonHomePage() {
  const isPreview = usePreviewMode();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#111827] flex flex-col font-manrope selection:bg-[#E31B23] selection:text-white">
      {/* TOP PREVIEW BANNER */}
      {isPreview && <PreviewBanner />}

      {/* OFFICIAL HEADER NAVIGATION */}
      <SiteHeader hasPreviewBanner={isPreview} />

      {/* =========================================================================
          SECTION 1: HERO ATHLETIC BENTO GRID ("5 Stakeholder Gateways")
         ========================================================================= */}
      <section className="relative w-full overflow-hidden pt-3 pb-8 sm:pt-4 sm:pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          {/* 5-PERSONA ATHLETIC BENTO GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-2.5 items-stretch">
            {/* CONTAINER 1: RUNNER (LEFT BIG SECTION) */}
            <div className="lg:col-span-7 relative rounded-[20px] overflow-hidden min-h-[540px] sm:min-h-[620px] flex flex-col justify-between p-6 sm:p-8 bg-neutral-900 shadow-lg">
              <img
                src="/images/runnerCard.jpg"
                alt="Rajgir Marathon Runner Athlete"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30 pointer-events-none" />

              {/* Top Title */}
              <div className="relative z-10">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase text-white tracking-tight leading-[0.92] font-barlow drop-shadow-md">
                  Rajgir<br />Marathon<br />Festival
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-neutral-300 font-manrope mt-2">
                  November 2027 • Rajgir, Nalanda, Bihar
                </p>
              </div>

              {/* Bottom Action Area */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4">
                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-5xl sm:text-7xl font-black text-white font-barlow tracking-tight leading-none">
                      42.2K
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#FFC928] font-manrope">
                      Full Marathon
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 font-semibold font-manrope">
                    2,987 of 4,500 Registered Runners
                  </p>
                  <div className="w-48 sm:w-60 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#FFC928] to-[#E31B23] rounded-full w-[66%]" />
                  </div>
                </div>

                <Link
                  href="/register/runner"
                  className="self-start sm:self-auto shrink-0 bg-[#FFC928] hover:bg-[#F5A623] text-neutral-950 font-black text-sm uppercase tracking-wider p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col justify-between w-32 h-28 sm:w-36 sm:h-32 transition-colors active:scale-95"
                >
                  <span className="leading-tight font-manrope text-xs sm:text-sm font-extrabold">
                    Register<br />Here
                  </span>
                  <FaArrowRight className="text-lg self-end" />
                </Link>
              </div>
            </div>

            {/* RIGHT 2x2 SECTION: 4 CONTAINERS */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {/* CONTAINER 2: COMMUNITY (TOP-LEFT) */}
              <div className="relative rounded-[20px] overflow-hidden min-h-[260px] sm:min-h-[300px] flex flex-col justify-between p-5 bg-neutral-900 shadow-md">
                <img
                  src="/images/volunteerCard.jpg"
                  alt="Community and Volunteers"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none" />

                <div className="relative z-10 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-neutral-200 font-barlow">
                  Community & Crew
                </div>

                <div className="relative z-10 space-y-2">
                  <div>
                    <div className="text-3xl sm:text-4xl font-black text-white font-barlow tracking-tight leading-none">
                      VOLUNTEER
                    </div>
                    <p className="text-[11px] text-neutral-300 font-semibold font-manrope mt-1">
                      400+ Crew & Clubs
                    </p>
                  </div>
                  <Link
                    href="/register/volunteer"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs uppercase tracking-wider text-center flex items-center justify-between transition-colors shadow-md"
                  >
                    <span>Register Here</span>
                    <FaArrowRight className="text-[10px]" />
                  </Link>
                </div>
              </div>

              {/* CONTAINER 3: SPONSOR (TOP-RIGHT) */}
              <div className="relative rounded-[20px] overflow-hidden min-h-[260px] sm:min-h-[300px] flex flex-col justify-between p-5 bg-neutral-900 shadow-md">
                <img
                  src="/images/why_world_class.png"
                  alt="Corporate & Brand Sponsors"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none" />

                <div className="relative z-10 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#FFC928] font-barlow">
                  Brand Partners
                </div>

                <div className="relative z-10 space-y-2">
                  <div>
                    <div className="text-3xl sm:text-4xl font-black text-white font-barlow tracking-tight leading-none">
                      SPONSOR
                    </div>
                    <p className="text-[11px] text-neutral-300 font-semibold font-manrope mt-1">
                      Brand Visibility & VIP Tents
                    </p>
                  </div>
                  <Link
                    href="/register/sponsor"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-between transition-colors shadow-md"
                  >
                    <span>Register Here</span>
                    <FaArrowRight className="text-[10px]" />
                  </Link>
                </div>
              </div>

              {/* CONTAINER 4: TOURISM (BOTTOM-LEFT) */}
              <div className="relative rounded-[20px] overflow-hidden min-h-[260px] sm:min-h-[300px] flex flex-col justify-between p-5 bg-neutral-900 shadow-md">
                <img
                  src="/images/why_tourism_camera.png"
                  alt="Tourism and Hospitality in Rajgir"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none" />

                <div className="relative z-10 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-neutral-200 font-barlow">
                  Hospitality & Stay
                </div>

                <div className="relative z-10 space-y-2">
                  <div>
                    <div className="text-3xl sm:text-4xl font-black text-white font-barlow tracking-tight leading-none">
                      TOURISM
                    </div>
                    <p className="text-[11px] text-neutral-300 font-semibold font-manrope mt-1">
                      Hotels & Heritage Guides
                    </p>
                  </div>
                  <Link
                    href="/register/tourism"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs uppercase tracking-wider text-center flex items-center justify-between transition-colors shadow-md"
                  >
                    <span>Register Here</span>
                    <FaArrowRight className="text-[10px]" />
                  </Link>
                </div>
              </div>

              {/* CONTAINER 5: VENDOR (BOTTOM-RIGHT) */}
              <div className="relative rounded-[20px] overflow-hidden min-h-[260px] sm:min-h-[300px] flex flex-col justify-between p-5 bg-neutral-900 shadow-md">
                <img
                  src="/images/why_premium_tshirt.png"
                  alt="Expo Vendors and Sports Merchandise"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none" />

                <div className="relative z-10 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-neutral-200 font-barlow">
                  Expo & Stalls
                </div>

                <div className="relative z-10 space-y-2">
                  <div>
                    <div className="text-3xl sm:text-4xl font-black text-white font-barlow tracking-tight leading-none">
                      VENDOR
                    </div>
                    <p className="text-[11px] text-neutral-300 font-semibold font-manrope mt-1">
                      Fitness Expo & Food Stalls
                    </p>
                  </div>
                  <Link
                    href="/register/vendor"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs uppercase tracking-wider text-center flex items-center justify-between transition-colors shadow-md"
                  >
                    <span>Register Here</span>
                    <FaArrowRight className="text-[10px]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: KEY EVENT STATISTICS STRIP
         ========================================================================= */}
      <section className="w-full bg-[#F8F8F6] border-b border-[#E5E7EB] py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            {/* Stat 1 */}
            <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-sm">
              <div className="font-barlow font-black text-4xl sm:text-5xl text-[#E31B23] tracking-tight">
                42.2 KM
              </div>
              <div className="font-manrope text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111827] mt-1">
                Full Marathon Course
              </div>
              <div className="text-xs text-[#6B7280] mt-0.5">Flagship Historic Circuit</div>
            </div>

            {/* Stat 2 */}
            <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-sm">
              <div className="font-barlow font-black text-4xl sm:text-5xl text-[#111827] tracking-tight">
                5,000+
              </div>
              <div className="font-manrope text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111827] mt-1">
                Expected Runners
              </div>
              <div className="text-xs text-[#6B7280] mt-0.5">From Pan-India & Global</div>
            </div>

            {/* Stat 3 */}
            <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-sm">
              <div className="font-barlow font-black text-4xl sm:text-5xl text-[#C78A12] tracking-tight">
                ₹15 Lakh+
              </div>
              <div className="font-manrope text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111827] mt-1">
                Total Cash Prize Purse
              </div>
              <div className="text-xs text-[#6B7280] mt-0.5">Across All Categories</div>
            </div>

            {/* Stat 4 */}
            <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-sm">
              <div className="font-barlow font-black text-4xl sm:text-5xl text-[#111827] tracking-tight">
                2,500 Yrs
              </div>
              <div className="font-manrope text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111827] mt-1">
                Living Heritage
              </div>
              <div className="text-xs text-[#6B7280] mt-0.5">Ancient Magadha Capital</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: CHOOSE YOUR EXPERIENCE (6 Persona Pathways)
         ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-[#E31B23] font-manrope">
            Personalized Gateways
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#111827] tracking-tight mt-1 font-barlow">
            CHOOSE YOUR MARATHON JOURNEY
          </h2>
          <p className="text-sm sm:text-base text-[#4B5563] max-w-2xl mx-auto mt-2 font-manrope">
            Whether you are chasing a personal best, supporting the event crew, or showcasing your organization, find your dedicated pathway.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personaPathways.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-xl border border-[#E5E7EB] bg-white p-7 shadow-sm hover:shadow-md hover:border-[#E31B23]/40 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-red-50 border border-red-100 text-[#E31B23] flex items-center justify-center text-xl group-hover:bg-[#E31B23] group-hover:text-white transition-colors">
                      <Icon />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 text-[#374151] border border-gray-200">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#111827] mb-1 group-hover:text-[#E31B23] transition-colors">
                    {item.title}
                  </h3>
                  <div className="text-xs font-semibold text-[#C78A12] mb-3 uppercase tracking-wider">
                    {item.tagline}
                  </div>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-6 font-manrope">
                    {item.description}
                  </p>
                </div>

                <Link
                  href={item.href}
                  className="w-full py-2.5 px-4 rounded-lg bg-gray-50 hover:bg-[#E31B23] text-[#111827] hover:text-white font-bold text-xs uppercase tracking-wider text-center border border-gray-200 hover:border-[#E31B23] transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{item.cta}</span>
                  <FaChevronRight className="text-[9px]" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: OFFICIAL RACE CATEGORIES (42.2K, 21.1K, 10K, 5K)
         ========================================================================= */}
      <section id="categories" className="py-20 bg-[#F8F8F6] border-t border-[#E5E7EB] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-[#E31B23] font-manrope">
              Find Your Distance
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#111827] tracking-tight mt-1 font-barlow">
              OFFICIAL RACE CATEGORIES
            </h2>
            <p className="text-sm sm:text-base text-[#4B5563] max-w-2xl mx-auto mt-2 font-manrope">
              Course routes certified to international standards. Choose your challenge across professional and community distances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {raceCategories.map((cat, idx) => (
              <div
                key={idx}
                className={`rounded-xl border border-[#E5E7EB] bg-white p-7 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group ${cat.borderAccent}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${cat.badgeColor}`}
                    >
                      {cat.badge}
                    </span>
                    <span className="text-xs font-bold text-[#6B7280]">
                      {cat.timeLimit}
                    </span>
                  </div>

                  <div className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight font-barlow mb-0.5">
                    {cat.distance}
                  </div>
                  <h3 className="text-sm font-bold text-[#E31B23] mb-2">{cat.name}</h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-5 font-manrope">
                    {cat.description}
                  </p>

                  <div className="border-t border-gray-100 pt-4 mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block mb-2.5">
                      Included Runner Amenities:
                    </span>
                    <ul className="space-y-2">
                      {cat.perks.map((p, pIdx) => (
                        <li key={pIdx} className="text-xs text-[#374151] flex items-start gap-2">
                          <FaCheck className="text-[10px] text-[#E31B23] shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Link
                  href={`/register/runner?distance=${encodeURIComponent(cat.distance)}`}
                  className={`w-full py-3 px-4 rounded-lg font-bold text-xs uppercase tracking-wider text-center transition-all shadow-sm ${cat.buttonBg}`}
                >
                  Register {cat.distance}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: DISCOVER RAJGIR (Heritage Landmarks)
         ========================================================================= */}
      <section id="route" className="py-20 bg-[#FFF9EF]/60 border-t border-[#E5E7EB] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-[#C78A12] font-manrope">
              The Sacred Trail
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#111827] tracking-tight mt-1 font-barlow">
              RUN THROUGH SACRED MAGADHA HERITAGE
            </h2>
            <p className="text-sm sm:text-base text-[#4B5563] max-w-2xl mx-auto mt-2 font-manrope">
              The marathon course traverses 2,500 years of living history, passing ancient rock walls, sacred groves, and peace pagodas nestled in the Rajgir hills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {heritageHighlights.map((site, sIdx) => (
              <div
                key={sIdx}
                className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm hover:shadow-md hover:border-[#C78A12]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-[#C78A12] uppercase tracking-wider block mb-1">
                    {site.tag}
                  </span>
                  <h3 className="text-base font-bold text-[#111827] mb-2">{site.title}</h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-4 font-manrope">
                    {site.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#6B7280]">
                  <span className="flex items-center gap-1">
                    <FaRoute className="text-[#C78A12]" />
                    <span>Course Highlight</span>
                  </span>
                  <span className="font-semibold text-[#111827]">{site.elevation}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Heritage Quote Banner */}
          <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-xl text-[#C78A12] shrink-0">
                <FaAward />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#111827]">
                  AIMS & Athletics Federation Measured Course
                </h4>
                <p className="text-xs text-[#4B5563] mt-0.5">
                  Every kilometer is calibrated for accurate splits, safe gradient management, and runner welfare.
                </p>
              </div>
            </div>
            <Link
              href="/register/runner"
              className="px-6 py-2.5 rounded-lg bg-[#111827] hover:bg-[#E31B23] text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0 shadow-sm"
            >
              View Route Map & Bibs →
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: RUNNING COMMUNITIES & CLUBS SPOTLIGHT
         ========================================================================= */}
      <section className="py-20 bg-white border-t border-[#E5E7EB] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#E5E7EB] bg-gradient-to-r from-gray-50 via-white to-gray-50 p-8 sm:p-12 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-black uppercase tracking-widest text-[#E31B23] font-manrope">
                  Pan-India Athletics Community
                </span>
                <h2 className="text-3xl sm:text-4xl font-black uppercase text-[#111827] tracking-tight font-barlow">
                  BRING YOUR RUNNING CLUB OR CREW TO RAJGIR
                </h2>
                <p className="text-sm text-[#4B5563] leading-relaxed font-manrope">
                  Running groups, corporate fitness chapters, and athletic academies get exclusive perks: reserved team canopies at the Race Village, customized club bib printing, bulk registration discounts, and team leaderboard trophies.
                </p>

                <div className="pt-2 flex flex-wrap gap-4">
                  <Link
                    href="/join"
                    className="h-[44px] px-6 rounded-lg bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-red-500/20 flex items-center gap-2 transition-all"
                  >
                    <FaUsers />
                    <span>Register Your Running Club</span>
                  </Link>
                  <Link
                    href="/contact"
                    className="h-[44px] px-6 rounded-lg bg-white border border-[#D1D5DB] hover:bg-gray-50 text-[#111827] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm"
                  >
                    <span>Request Group Bib Pricing</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Community Highlights */}
              <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                    Participating Crews
                  </span>
                  <span className="text-xs font-extrabold text-[#E31B23]">
                    30+ Registered Clubs
                  </span>
                </div>

                <div className="space-y-2 text-xs text-[#374151]">
                  <div className="flex items-center justify-between p-2 rounded bg-gray-50">
                    <span className="font-semibold">Patna Pacesetters</span>
                    <span className="text-[#6B7280]">50+ Runners</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-gray-50">
                    <span className="font-semibold">Kolkata Striders</span>
                    <span className="text-[#6B7280]">35+ Runners</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-gray-50">
                    <span className="font-semibold">Delhi NCR Roadrunners</span>
                    <span className="text-[#6B7280]">40+ Runners</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-gray-50">
                    <span className="font-semibold">Ranchi Harriers Club</span>
                    <span className="text-[#6B7280]">25+ Runners</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#6B7280] italic text-center pt-1">
                  “Running between Rajgir’s ancient fortress walls is an unforgettable spiritual & athletic high.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: RACE EXPERIENCE & RUNNER AMENITIES
         ========================================================================= */}
      <section id="perks" className="py-20 bg-[#F8F8F6] border-t border-[#E5E7EB] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-[#E31B23] font-manrope">
              World-Class Standards
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#111827] tracking-tight mt-1 font-barlow">
              RUNNER SAFETY & WORLD-CLASS AMENITIES
            </h2>
            <p className="text-sm sm:text-base text-[#4B5563] max-w-2xl mx-auto mt-2 font-manrope">
              Comprehensive athlete care from the moment you pick up your bib to the post-race celebration village.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {raceAmenities.map((amenity, aIdx) => {
              const Icon = amenity.icon;
              return (
                <div
                  key={aIdx}
                  className="rounded-xl border border-[#E5E7EB] bg-white p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-start"
                >
                  <div
                    className={`w-12 h-12 rounded-lg border flex items-center justify-center text-xl mb-4 ${amenity.color}`}
                  >
                    <Icon />
                  </div>
                  <h3 className="text-base font-bold text-[#111827] mb-2">{amenity.title}</h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed font-manrope">
                    {amenity.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: OFFICIAL SPONSORS & INSTITUTIONAL PARTNERS
         ========================================================================= */}
      <section className="py-16 bg-white border-t border-[#E5E7EB] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-black uppercase tracking-widest text-[#6B7280] font-manrope">
            Institutional Alliances
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#111827] tracking-tight mt-1 font-barlow">
            OUR VALUED PARTNERS & INSTITUTIONAL SUPPORTERS
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] max-w-xl mx-auto mt-1 font-manrope">
            Organized in cooperation with local sports councils, district administration, and cultural tourism bodies.
          </p>

          {/* Partner Badges Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 items-center justify-center mt-10">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-[#374151] flex flex-col items-center justify-center h-20 shadow-sm">
              <FaShieldAlt className="text-lg text-[#E31B23] mb-1" />
              <span>Bihar Tourism</span>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-[#374151] flex flex-col items-center justify-center h-20 shadow-sm">
              <FaAward className="text-lg text-[#C78A12] mb-1" />
              <span>Athletics Fed. Stds</span>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-[#374151] flex flex-col items-center justify-center h-20 shadow-sm">
              <FaBuilding className="text-lg text-[#111827] mb-1" />
              <span>Nalanda Admin</span>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-[#374151] flex flex-col items-center justify-center h-20 shadow-sm">
              <FaRoute className="text-lg text-emerald-600 mb-1" />
              <span>Magadha Heritage</span>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-[#374151] flex flex-col items-center justify-center h-20 shadow-sm">
              <FaHeartbeat className="text-lg text-red-600 mb-1" />
              <span>Apollo Health Partner</span>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-[#374151] flex flex-col items-center justify-center h-20 shadow-sm">
              <FaTint className="text-lg text-blue-600 mb-1" />
              <span>Enerzal Hydration</span>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/join"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#E31B23] hover:text-[#B5121B] uppercase tracking-wider transition-colors"
            >
              <span>Explore Sponsorship Tiers & Brand Activation Stalls</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: STORIES & UPDATES (Editorial Magazine Layout)
         ========================================================================= */}
      <section className="py-20 bg-[#F8F8F6] border-t border-[#E5E7EB] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#E31B23] font-manrope">
                Editorial & Insights
              </span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#111827] tracking-tight mt-1 font-barlow">
                STORIES FROM THE TRAIL
              </h2>
            </div>
            <Link
              href="/contact"
              className="text-xs font-bold text-[#E31B23] hover:text-[#B5121B] uppercase tracking-wider flex items-center gap-1.5"
            >
              <span>View All News & Updates</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {editorialStories.map((story, sIdx) => (
              <div
                key={sIdx}
                className="rounded-xl border border-[#E5E7EB] bg-white p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#6B7280] mb-3">
                    <span className="font-bold text-[#E31B23] uppercase tracking-wider text-[10px]">
                      {story.category}
                    </span>
                    <span>{story.readTime}</span>
                  </div>

                  <h3 className="text-lg font-bold text-[#111827] mb-3 group-hover:text-[#E31B23] transition-colors leading-snug">
                    {story.title}
                  </h3>

                  <p className="text-xs text-[#4B5563] leading-relaxed mb-6 font-manrope">
                    {story.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[#6B7280]">{story.date}</span>
                  <span className="font-bold text-[#111827] group-hover:text-[#E31B23] transition-colors flex items-center gap-1">
                    <span>Read Article</span>
                    <FaChevronRight className="text-[9px]" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 10: NEWSLETTER SUBSCRIPTION STRIP
         ========================================================================= */}
      <section className="py-16 bg-white border-t border-[#E5E7EB] w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#E31B23] text-xs font-bold uppercase tracking-wider mb-3">
            <span>Stay in the Loop</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black uppercase text-[#111827] tracking-tight font-barlow">
            NEVER MISS A MARATHON UPDATE
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] max-w-xl mx-auto mt-2 font-manrope">
            Subscribe for early bird registration alerts, official course maps, bib expo announcements, and travel guides directly to your inbox.
          </p>

          {newsletterSubmitted ? (
            <div className="mt-8 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold max-w-md mx-auto flex items-center justify-center gap-2">
              <FaCheckCircle className="text-emerald-600" />
              <span>Thank you! You are on the early bird notification list.</span>
            </div>
          ) : (
            <form
              onSubmit={handleNewsletterSubmit}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto"
            >
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full sm:flex-1 h-[48px] px-4 rounded-lg border border-[#D1D5DB] bg-white text-[#111827] text-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E31B23] focus:border-transparent transition-all shadow-sm"
              />
              <button
                type="submit"
                className="w-full sm:w-auto h-[48px] px-6 rounded-lg bg-[#E31B23] hover:bg-[#B5121B] text-white font-manrope font-bold text-xs uppercase tracking-wider shadow-md shadow-red-500/20 active:scale-95 transition-all whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          )}

          <p className="text-[11px] text-[#9CA3AF] mt-3">
            We respect your privacy. Zero spam. Unsubscribe at any time.
          </p>
        </div>
      </section>

      {/* OFFICIAL WHITE-MODE FOOTER */}
      <SiteFooter />
    </div>
  );
}
