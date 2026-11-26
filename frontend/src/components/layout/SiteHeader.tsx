"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import { LuSearch, LuUserRound } from "react-icons/lu";
import { useHeaderUser } from "@/components/layout/HeaderAuth";
import { MegaNav } from "./MegaMenu";
import { MobileDrawer } from "./MobileDrawer";
import { NotificationBell } from "./NotificationBell";
import { AvatarMenu } from "./AvatarMenu";
import { UtilityBar } from "./UtilityBar";
import { useSearch } from "@/components/search/SearchContext";

/** Header action buttons share size, shape and the round icon badge; Search is the soft utility pill, Log in the solid brand-red one. */
const PILL_BASE =
  "group inline-flex h-11 items-center gap-2.5 whitespace-nowrap rounded-full pl-1.5 pr-4 font-manrope text-[13px] font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E31B23]";
const SEARCH_PILL = `${PILL_BASE} bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] hover:text-[#111827]`;
const SEARCH_BADGE =
  "flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#E31B23] shadow-[0_1px_3px_rgba(17,24,39,0.12)] transition-transform group-hover:scale-105";
const LOGIN_PILL = `${PILL_BASE} bg-gradient-to-b from-[#F0343C] to-[#CF1018] text-white hover:from-[#E6252D] hover:to-[#B80E15]`;
const LOGIN_BADGE = "flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition-transform group-hover:scale-105";

interface SiteHeaderProps {
  /** If a preview top banner is rendered above the header, pass hasPreviewBanner=true */
  hasPreviewBanner?: boolean;
}

/**
 * Two-row public header.
 *  Row 1 (desktop): countdown, help, quick links, search, language, account (UtilityBar).
 *  Row 2: logo, one mega menu per journey stage (MegaNav) and the Register CTA.
 *  Mobile: compact bar with search / account / menu; the drawer carries the whole navigation.
 * All links come from lib/navigation (publicNav, megaMenu, audiences).
 */
export default function SiteHeader({ hasPreviewBanner = false }: SiteHeaderProps) {
  const pathname = usePathname();
  const user = useHeaderUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { open: openSearch } = useSearch();
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile drawer on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`w-full z-40 transition-shadow duration-300 ${hasPreviewBanner ? "sticky top-9" : "sticky top-0"} ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white/95 backdrop-blur-sm"
        } border-b border-[#E5E7EB]`}
      >
        <UtilityBar user={user} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3 xl:h-[72px] xl:gap-4">
            {/* Brand: the same logo as the Coming Soon page, logo only (no text) */}
            <Link href="/" aria-label="Rajgir Marathon home" className="group flex shrink-0 items-center focus:outline-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/rajgir_new_logo.png"
                alt="Rajgir Marathon Logo"
                className="h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105 xl:h-14"
              />
            </Link>

            {/* Desktop mega navigation */}
            <div className="hidden min-w-0 xl:block">
              <MegaNav />
            </div>

            {/* Desktop actions: Search and Log in (signed-in users have the account menu in the top bar) */}
            <div className="hidden shrink-0 items-center gap-2 xl:flex">
              <button type="button" onClick={openSearch} aria-label="Search (Ctrl K)" title="Search · Ctrl K" className={SEARCH_PILL}>
                <span className={SEARCH_BADGE}>
                  <LuSearch className="h-[17px] w-[17px]" aria-hidden />
                </span>
                Search
              </button>
              {!user ? (
                <Link href="/login" className={LOGIN_PILL}>
                  <span className={LOGIN_BADGE}>
                    <LuUserRound className="h-[17px] w-[17px]" aria-hidden />
                  </span>
                  Log in
                </Link>
              ) : null}
            </div>

            {/* Mobile / tablet cluster */}
            <div className="flex shrink-0 items-center gap-1.5 xl:hidden">
              <button
                type="button"
                onClick={openSearch}
                aria-label="Search"
                className={`${user ? "hidden sm:flex" : "flex"} h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#111827] transition-colors hover:bg-[#E5E7EB] hover:text-[#E31B23]`}
              >
                <LuSearch className="text-lg" aria-hidden />
              </button>
              {user ? (
                <>
                  <NotificationBell role={user.role} />
                  <AvatarMenu name={user.name} role={user.role} status={user.status} compact />
                </>
              ) : (
                <Link href="/login" aria-label="Log in" className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-[#F0343C] to-[#CF1018] text-white transition-colors hover:from-[#E6252D] hover:to-[#B80E15]">
                  <FaUserCircle className="text-lg" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                aria-expanded={mobileOpen}
                aria-label="Toggle navigation menu"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-[#111827] transition-colors hover:bg-[#E5E7EB] hover:text-[#E31B23] focus:outline-none"
              >
                {mobileOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileDrawer open={mobileOpen} onClose={closeMobile} user={user} onSearch={openSearch} />
    </>
  );
}
