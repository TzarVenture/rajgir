"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaLinkedinIn,
  FaEnvelope,
  FaGlobe,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaCheck,
  FaChevronRight,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function ComingSoonFooter() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const navItems = [
    { label: "Run", href: "/contact?tab=runner", isRoute: true },
    { label: "Race info", href: "/contact?tab=general", isRoute: true },
    { label: "Explore", href: isHomePage ? "#explore" : "/#explore", isRoute: !isHomePage },
    { label: "Experience", href: isHomePage ? "#experience" : "/#experience", isRoute: !isHomePage },
    { label: "Sponsors", href: "/contact?tab=sponsor", isRoute: true },
    { label: "A Healthier Tomorrow", href: isHomePage ? "#healthier-tomorrow" : "/#healthier-tomorrow", isRoute: !isHomePage },
    { label: "#rajgirmarathon", href: isHomePage ? "#rajgirmarathon" : "/#rajgirmarathon", isRoute: !isHomePage },
    { label: "Contact Us", href: "/contact", isRoute: true },
  ];

  const handleNavClick = (item: (typeof navItems)[number]) => {
    if (item.isRoute) {
      window.scrollTo(0, 0);
    } else {
      const targetId = item.href.replace(/^#/, "").replace(/^\/#/, "");
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo(0, 0);
      }
    }
  };

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\s/g, "").slice(0, 80);
    setEmail(clean);
    if (emailError) {
      if (emailRegex.test(clean)) {
        setEmailError("");
      }
    }
  };

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setEmailError("");
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail("");
    }, 5000);
  };

  return (
    <footer className="w-full bg-[#080808] text-white select-none">
      {/* Top Heritage Golden Border Line */}
      <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#cca043]/40 to-transparent" />

      {/* Main 4-Column Content Container */}
      <div className="w-full px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-10 sm:py-12 lg:py-14">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 xl:gap-8 items-start">
          
          {/* COLUMN 1: STAY CONNECTED */}
          <div className="w-full flex flex-col items-start text-left">
            <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-[0.16em] text-[#d49a37]">
              STAY CONNECTED
            </h3>
            <p className="text-xs sm:text-[13px] text-neutral-300 font-medium mt-1 mb-3.5 leading-snug">
              Be the first to know when registrations open!
            </p>

            <form
              onSubmit={handleSubscribe}
              className={`w-full max-w-[270px] sm:max-w-[285px] bg-white rounded-full p-1 pl-3 flex items-center shadow-md transition-all ${
                emailError
                  ? "ring-2 ring-red-500"
                  : "focus-within:ring-2 focus-within:ring-[#b91c1c]/50"
              }`}
            >
              <input
                type="email"
                required
                maxLength={80}
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter email address"
                className="w-full bg-transparent text-neutral-900 placeholder:text-neutral-400 text-xs font-medium outline-none pr-1.5 min-w-0"
              />
              <button
                type="submit"
                className="shrink-0 bg-[#b91c1c] hover:bg-[#991b1b] text-white font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full transition-all duration-200 active:scale-95 shadow cursor-pointer flex items-center gap-1"
              >
                {subscribed ? (
                  <>
                    <FaCheck className="text-[9px]" />
                    <span>DONE</span>
                  </>
                ) : (
                  <span>SUBSCRIBE</span>
                )}
              </button>
            </form>

            {emailError && (
              <p className="text-[10.5px] text-red-400 font-medium mt-1.5">
                {emailError}
              </p>
            )}

            {subscribed && (
              <p className="text-[11px] sm:text-xs text-emerald-400 font-medium mt-2 flex items-center gap-1.5">
                <FaCheck /> Thank you! We will notify you when registrations open.
              </p>
            )}

            {/* Social Media Circular Badges */}
            <div className="flex items-center gap-2 sm:gap-2.5 mt-4 sm:mt-5">
              {[
                {
                  icon: FaInstagram,
                  label: "Instagram",
                  href: "https://www.instagram.com/rajgirmarathon",
                },
                {
                  icon: FaFacebookF,
                  label: "Facebook",
                  href: "https://www.facebook.com/rajgirmarathon",
                },
                {
                  icon: FaXTwitter,
                  label: "X (Twitter)",
                  href: "https://x.com/Rajgirmarathon",
                },
                {
                  icon: FaYoutube,
                  label: "YouTube",
                  href: "https://www.youtube.com/@rajgirmarathon",
                },
                {
                  icon: FaLinkedinIn,
                  label: "LinkedIn",
                  href: "https://www.linkedin.com/company/rajgir-marathon",
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <a
                    key={idx}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-neutral-900 flex items-center justify-center text-xs sm:text-sm hover:scale-115 hover:bg-[#d49a37] hover:text-white transition-all duration-200 shadow cursor-pointer"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2: QUICK LINKS */}
          <div className="w-full flex flex-col items-start text-left">
            <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-[0.16em] text-[#d49a37] mb-2 sm:mb-2.5">
              QUICK LINKS
            </h3>
            <div className="flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-[13px] text-neutral-200">
              {navItems.map((item) => {
                const linkClass =
                  "flex items-center gap-1.5 text-neutral-300 hover:text-[#d49a37] transition-colors duration-200 group py-0.5 cursor-pointer";
                const chevron = (
                  <FaChevronRight className="text-[8px] text-[#cca043]/70 group-hover:text-[#cca043] group-hover:translate-x-0.5 transition-all shrink-0" />
                );

                return item.isRoute ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => handleNavClick(item)}
                    className={linkClass}
                  >
                    {chevron}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => handleNavClick(item)}
                    className={linkClass}
                  >
                    {chevron}
                    <span className="font-medium">{item.label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* COLUMN 3: CENTER ARTWORK */}
          <div className="w-full flex flex-col items-center justify-center px-2 py-1">
            <img
              src="/images/footer_run_through_history.png"
              alt="Rajgir Marathon - Run Through History"
              className="w-full max-w-[260px] sm:max-w-[300px] lg:max-w-none h-auto object-contain select-none pointer-events-none"
            />
          </div>

          {/* COLUMN 4: ORGANISED BY & CONTACT DETAILS */}
          <div className="w-full flex flex-col items-start text-left">
            <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-[0.16em] text-[#d49a37] mb-2 sm:mb-2.5">
              ORGANISED BY
            </h3>

            <div className="flex flex-col gap-2 sm:gap-2.5 text-xs sm:text-[13px] text-neutral-200">
              <a
                href="mailto:rajgirmarathon@gmail.com"
                className="flex items-center gap-2.5 hover:text-[#d49a37] transition-colors"
              >
                <FaEnvelope className="text-[#d49a37] text-sm shrink-0" />
                <span className="font-medium">rajgirmarathon@gmail.com</span>
              </a>

              <a
                href="https://www.rajgirmarathon.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-[#d49a37] transition-colors"
              >
                <FaGlobe className="text-[#d49a37] text-sm shrink-0" />
                <span className="font-medium">www.rajgirmarathon.com</span>
              </a>

              <a
                href="tel:+918882520326"
                className="flex items-center gap-2.5 hover:text-[#d49a37] transition-colors"
              >
                <FaPhoneAlt className="text-[#d49a37] text-sm shrink-0" />
                <span className="font-medium">+91 8882520326</span>
              </a>

              <div className="flex items-center gap-2.5">
                <FaMapMarkerAlt className="text-[#d49a37] text-sm shrink-0" />
                <span className="font-medium">Rajgir, Bihar, India</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM RED BANNER */}
      <div
        className="w-full py-3.5 px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 text-center font-extrabold tracking-[0.14em] sm:tracking-[0.2em] uppercase text-xs sm:text-sm text-white shadow-xl"
        style={{
          background: "linear-gradient(90deg, #990f17 0%, #d62828 50%, #990f17 100%)",
          borderTop: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        <p className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          <span>RAJGIR MARATHON</span>
          <span className="text-white/50">|</span>
          <span>COMING SOON</span>
          <span className="text-white/50">|</span>
          <span className="text-[#fde047]">
            RUN WITH PURPOSE. FINISH WITH PRIDE.
          </span>
        </p>
      </div>
    </footer>
  );
}

