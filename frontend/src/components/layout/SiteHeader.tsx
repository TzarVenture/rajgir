"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaRunning,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaArrowRight,
  FaCalendarAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

interface SiteHeaderProps {
  /** If a preview top banner is rendered above the header, pass hasPreviewBanner=true */
  hasPreviewBanner?: boolean;
}

export default function SiteHeader({ hasPreviewBanner = false }: SiteHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Races", href: "/#categories" },
    { label: "Heritage Route", href: "/#route" },
    { label: "Perks & Amenities", href: "/#perks" },
    { label: "Community", href: "/join" },
    { label: "Contact", href: "/contact" },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return pathname === "/" && typeof window !== "undefined" && window.location.hash === href.replace("/", "");
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`w-full z-40 transition-all duration-300 ${
        hasPreviewBanner ? "sticky top-9" : "sticky top-0"
      } ${
        scrolled
          ? "bg-[#0a0705]/95 backdrop-blur-md shadow-xl border-b border-white/10"
          : "bg-[#0c0906]/90 backdrop-blur-sm border-b border-white/10"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* 1. BRAND LOGO */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none shrink-0">
            <img
              src="/images/mainLogo.png"
              alt="Rajgir Marathon Logo"
              className="h-10 sm:h-12 md:h-14 w-auto object-contain drop-shadow transition-transform duration-200 group-hover:scale-105"
            />
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-sm sm:text-base lg:text-lg tracking-wider text-white font-graduate leading-tight">
                RAJGIR MARATHON
              </span>
              <span className="text-[9.5px] sm:text-[10px] tracking-widest uppercase text-[#cca043] font-bold">
                Run Through History • 2027
              </span>
            </div>
          </Link>

          {/* 2. DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-bold uppercase tracking-wider">
            {navLinks.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`transition-colors duration-200 py-1 relative group ${
                    active ? "text-[#cca043]" : "text-neutral-300 hover:text-white"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-[#cca043] transition-all duration-200 ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* 3. RIGHT CTAS */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/admin"
              className="px-3.5 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
            >
              <FaUserCircle className="text-sm text-[#cca043]" />
              <span>Portal</span>
            </Link>

            <Link
              href="/register/runner"
              className="py-2.5 px-5 sm:px-6 rounded-full bg-gradient-to-r from-[#e51b24] via-[#dc2626] to-[#b91c1c] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-950/40 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Register Now</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          {/* 4. MOBILE HAMBURGER BUTTON */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/register/runner"
              className="sm:hidden py-1.5 px-3.5 rounded-full bg-[#e51b24] text-white font-extrabold text-[11px] uppercase tracking-wider shadow"
            >
              Register
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:text-[#cca043] focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
            </button>
          </div>
        </div>
      </div>

      {/* 5. MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0c0906]/98 backdrop-blur-xl px-5 pt-4 pb-6 space-y-3 animate-fadeIn">
          <div className="flex flex-col space-y-2">
            {navLinks.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all ${
                    active
                      ? "bg-[#cca043]/15 text-[#cca043] border border-[#cca043]/30"
                      : "text-neutral-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            <Link
              href="/register/runner"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#e51b24] to-[#b91c1c] text-white font-extrabold text-xs uppercase tracking-wider text-center shadow-lg shadow-red-950/40 flex items-center justify-center gap-2"
            >
              <FaRunning />
              <span>Register As Runner</span>
            </Link>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/join"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg bg-white/5 border border-white/10 text-neutral-300 text-xs font-bold uppercase tracking-wider text-center hover:bg-white/10"
              >
                Volunteer / Creator
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg bg-white/5 border border-white/10 text-neutral-300 text-xs font-bold uppercase tracking-wider text-center hover:bg-white/10"
              >
                Portal Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

