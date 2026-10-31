"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FaInstagram, FaFacebookF, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { FiMenu, FiX } from "react-icons/fi";

interface ComingSoonHeaderProps {
  isAbsolute?: boolean;
}

function NavLinks({ onMobileItemClick }: { onMobileItemClick?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHomePage = pathname === "/";

  const navItems = [
    { label: "Run", href: "/contact?tab=runner", isRoute: true, tab: "runner" },
    { label: "Race info", href: "/contact?tab=general", isRoute: true, tab: "general" },
    { label: "Explore", href: isHomePage ? "#explore" : "/#explore", isRoute: !isHomePage },
    { label: "Experience", href: isHomePage ? "#experience" : "/#experience", isRoute: !isHomePage },
    { label: "Sponsors", href: "/contact?tab=sponsor", isRoute: true, tab: "sponsor" },
    { label: "A Healthier Tomorrow", href: isHomePage ? "#healthier-tomorrow" : "/#healthier-tomorrow", isRoute: !isHomePage },
    { label: "#rajgirmarathon", href: isHomePage ? "#rajgirmarathon" : "/#rajgirmarathon", isRoute: !isHomePage },
  ];

  const getIsActive = (item: (typeof navItems)[number]) => {
    if (item.tab) {
      if (pathname === "/contact") {
        const currentTab = searchParams.get("tab") || "runner";
        return currentTab === item.tab;
      }
      return false;
    }
    if (item.isRoute) {
      return pathname === item.href;
    }
    return false;
  };

  return (
    <>
      {navItems.map((item) => {
        const isActive = getIsActive(item);

        const className = `text-[12px] xl:text-[13px] 2xl:text-[14px] font-bold tracking-[0.08em] xl:tracking-[0.1em] uppercase transition-colors duration-200 relative group py-1 whitespace-nowrap ${
          isActive ? "text-[#e51b24]" : "text-white/95 hover:text-[#e51b24]"
        }`;

        return item.isRoute ? (
          <Link
            key={item.label}
            href={item.href}
            onClick={onMobileItemClick}
            className={className}
          >
            {item.label}
            <span
              className={`absolute bottom-0 left-0 h-[2px] bg-[#e51b24] transition-all duration-200 ${
                isActive ? "w-full" : "w-0 group-hover:w-full"
              }`}
            />
          </Link>
        ) : (
          <a
            key={item.label}
            href={item.href}
            onClick={onMobileItemClick}
            className={className}
          >
            {item.label}
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#e51b24] transition-all duration-200 group-hover:w-full" />
          </a>
        );
      })}
    </>
  );
}

export default function ComingSoonHeader({ isAbsolute = true }: ComingSoonHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={`${
        isAbsolute ? "absolute top-0 left-0" : "relative"
      } z-40 w-full px-4 sm:px-6 md:px-8 lg:px-8 xl:px-12 2xl:px-16 py-3 lg:py-4 flex items-center justify-between transition-all`}
      style={{
        background: "linear-gradient(to bottom, rgba(5,3,1,0.92) 0%, rgba(5,3,1,0.5) 70%, rgba(5,3,1,0) 100%)",
      }}
    >
      {/* LOGO */}
      <Link href="/" className="flex items-center group cursor-pointer focus:outline-none shrink-0">
        <img
          src="/images/rajgir_new_logo.png"
          alt="Rajgir Marathon Logo"
          className="h-14 sm:h-18 lg:h-20 xl:h-22 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
        />
      </Link>

      {/* MENU ITEMS (Desktop) - Wrapped in Suspense */}
      <nav className="hidden lg:flex items-center gap-3.5 xl:gap-5 2xl:gap-7">
        <Suspense fallback={<div className="h-6" />}>
          <NavLinks />
        </Suspense>
      </nav>

      {/* RIGHT SIDE: Circular Social Icons & Mobile Toggle */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="hidden sm:flex items-center gap-2.5">
          <a
            href="https://www.instagram.com/rajgirmarathon"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white/80 hover:text-white hover:border-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
          >
            <FaInstagram className="text-[13px]" />
          </a>
          <a
            href="https://facebook.com/rajgirmarathon"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white/80 hover:text-white hover:border-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
          >
            <FaFacebookF className="text-[12px]" />
          </a>
          <a
            href="https://x.com/Rajgirmarathon"
            target="_blank"
            rel="noreferrer"
            aria-label="Twitter / X"
            className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white/80 hover:text-white hover:border-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
          >
            <FaXTwitter className="text-[12px]" />
          </a>
          <a
            href="https://www.youtube.com/@rajgirmarathon"
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
            className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white/80 hover:text-white hover:border-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
          >
            <FaYoutube className="text-[13px]" />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white/90 hover:text-white focus:outline-none lg:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <FiX className="w-7 h-7" /> : <FiMenu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Drawer - Wrapped in Suspense */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#0c0c0d]/95 backdrop-blur-md border-b border-white/10 px-6 py-5 flex flex-col gap-3.5 z-50 shadow-2xl">
          <Suspense fallback={<div className="h-6" />}>
            <NavLinks onMobileItemClick={() => setMobileMenuOpen(false)} />
          </Suspense>

          <div className="flex items-center gap-3 pt-3">
            <a
              href="https://www.instagram.com/rajgirmarathon"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white/80"
            >
              <FaInstagram className="text-xs" />
            </a>
            <a
              href="https://facebook.com/rajgirmarathon"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white/80"
            >
              <FaFacebookF className="text-xs" />
            </a>
            <a
              href="https://x.com/Rajgirmarathon"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter / X"
              className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white/80"
            >
              <FaXTwitter className="text-xs" />
            </a>
            <a
              href="https://www.youtube.com/@rajgirmarathon"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white/80"
            >
              <FaYoutube className="text-xs" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
