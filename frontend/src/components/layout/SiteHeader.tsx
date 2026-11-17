"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { useHeaderUser } from "@/components/layout/HeaderAuth";
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
  const user = useHeaderUser();
  const firstName = user?.name.trim().split(" ")[0] ?? "";
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
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E5E7EB]"
          : "bg-white/90 backdrop-blur-sm border-b border-[#E5E7EB]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* 1. BRAND LOGO */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none shrink-0">
            <img
              src="/images/mainLogo.png"
              alt="Rajgir Marathon Logo"
              className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-sm sm:text-base lg:text-lg tracking-wider text-[#111827] font-graduate leading-tight">
                RAJGIR MARATHON
              </span>
              <span className="text-[9.5px] sm:text-[10px] tracking-widest uppercase text-[#C78A12] font-bold">
                Run Through History • 2027
              </span>
            </div>
          </Link>

          {/* 2. DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-bold uppercase tracking-wider font-manrope">
            {navLinks.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`transition-colors duration-200 py-1 relative group ${
                    active ? "text-[#E31B23]" : "text-[#4B5563] hover:text-[#111827]"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-[#E31B23] transition-all duration-200 ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* 3. RIGHT CTAS */}
          <div className="hidden sm:flex items-center gap-3">
{user ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-3.5 py-2 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] text-[#374151] hover:text-[#111827] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 font-manrope shadow-sm max-w-[11rem]"
                >
                  <FaUserCircle className="text-sm text-[#C78A12] shrink-0" />
                  <span className="truncate">{firstName}</span>
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="px-2 py-2 text-xs font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#E31B23] transition-colors font-manrope"
                  >
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-2 py-2 text-xs font-bold uppercase tracking-wider text-[#374151] hover:text-[#E31B23] transition-colors font-manrope"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-2 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] text-[#374151] hover:text-[#111827] text-xs font-bold uppercase tracking-wider transition-all font-manrope shadow-sm"
                >
                  Sign up
                </Link>
              </>
            )}

            <Link
              href="/register/runner"
              className="py-2.5 px-5 sm:px-6 rounded-lg bg-[#E31B23] hover:bg-[#B5121B] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-red-500/20 active:scale-95 transition-all flex items-center gap-2 font-manrope"
            >
              <span>Register Now</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          {/* 4. MOBILE HAMBURGER BUTTON */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href={user ? "/dashboard" : "/login"}
              aria-label={user ? "My dashboard" : "Log in"}
              className="sm:hidden w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-[#111827] hover:text-[#E31B23] transition-colors"
            >
              <FaUserCircle className="text-lg" />
            </Link>

            <Link
              href="/register/runner"
              className="sm:hidden py-1.5 px-3.5 rounded-lg bg-[#E31B23] text-white font-extrabold text-[11px] uppercase tracking-wider shadow font-manrope"
            >
              Register
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-[#111827] hover:text-[#E31B23] focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
            </button>
          </div>
        </div>
      </div>

      {/* 5. MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E5E7EB] bg-white/98 backdrop-blur-xl px-5 pt-4 pb-6 space-y-3 animate-fadeIn shadow-lg">
          <div className="flex flex-col space-y-1.5">
            {navLinks.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all font-manrope ${
                    active
                      ? "bg-red-50 text-[#E31B23] border border-red-100"
                      : "text-[#4B5563] hover:bg-gray-50 hover:text-[#111827]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#E5E7EB] flex flex-col gap-2.5">
            <Link
              href="/register/runner"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-lg bg-[#E31B23] hover:bg-[#B5121B] text-white font-extrabold text-xs uppercase tracking-wider text-center shadow-md shadow-red-500/20 flex items-center justify-center gap-2 font-manrope"
            >
              <FaRunning />
              <span>Register As Runner</span>
            </Link>

            {user ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg bg-gray-50 border border-gray-200 text-[#4B5563] text-xs font-bold uppercase tracking-wider text-center hover:bg-gray-100 hover:text-[#111827] font-manrope truncate"
                >
                  {firstName}: Dashboard
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-3 rounded-lg bg-gray-50 border border-gray-200 text-[#4B5563] text-xs font-bold uppercase tracking-wider text-center hover:bg-gray-100 hover:text-[#E31B23] font-manrope"
                  >
                    Log out
                  </button>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg bg-gray-50 border border-gray-200 text-[#4B5563] text-xs font-bold uppercase tracking-wider text-center hover:bg-gray-100 hover:text-[#111827] font-manrope"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg bg-gray-50 border border-gray-200 text-[#4B5563] text-xs font-bold uppercase tracking-wider text-center hover:bg-gray-100 hover:text-[#111827] font-manrope"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

