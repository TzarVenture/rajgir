"use client";

import React from "react";
import Link from "next/link";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaLinkedinIn,
  FaRunning,
  FaShieldAlt,
  FaHeartbeat,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  const raceDistances = [
    { label: "Full Marathon (42.2 KM)", distance: "42.2 KM", tag: "Flagship" },
    { label: "Half Marathon (21.1 KM)", distance: "21.1 KM", tag: "Popular" },
    { label: "Rajgir Hill Challenge (10 KM)", distance: "10 KM", tag: "Timed" },
    { label: "Heritage Dream Run (5 KM)", distance: "5 KM", tag: "Non-Timed" },
    { label: "Junior & Fun Run (3 KM)", distance: "3 KM", tag: "Family" },
  ];

  const portalLinks = [
    { label: "Runner Registration", href: "/register/runner" },
    { label: "Volunteer Crew Application", href: "/register/volunteer" },
    { label: "Influencer & Creator Hub", href: "/register/influencer" },
    { label: "Community & Partners Hub", href: "/join" },
    { label: "Race Command Center", href: "/admin" },
    { label: "Platform Modules Roadmap", href: "/wip" },
  ];

  return (
    <footer className="w-full bg-[#F8F8F6] border-t border-[#E5E7EB] text-[#4B5563] text-xs font-manrope">


      {/* 2. MAIN 4-COLUMN FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* COLUMN 1: BRAND & HERITAGE (Cols 1-4) */}
          <div className="lg:col-span-4 flex flex-col items-start space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/images/mainLogo.png"
                alt="Rajgir Marathon Logo"
                className="h-12 w-auto object-contain"
              />
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-base tracking-wider text-[#111827] font-graduate">
                  RAJGIR MARATHON
                </span>
                <span className="text-[10px] tracking-widest uppercase text-[#C78A12] font-bold">
                  Run Through History • 2027
                </span>
              </div>
            </Link>

            <p className="text-[#4B5563] leading-relaxed text-xs max-w-sm">
              India’s premier cultural and heritage marathon through the ancient capital of Magadha.
              Traverse rolling valley roads, forested hill trails, and timeless sacred monuments in Nalanda, Bihar.
            </p>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-[#374151]">
              <FaShieldAlt className="text-[#C78A12] text-sm shrink-0" />
              <span>Athletics Federation & International Course Standards</span>
            </div>
          </div>

          {/* COLUMN 2: RACE CATEGORIES (Cols 5-6) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#111827] font-barlow text-sm">
              Race Categories
            </h4>
            <div className="w-8 h-[2px] bg-[#E31B23]" />

            <ul className="space-y-2 pt-1">
              {raceDistances.map((race) => (
                <li key={race.distance}>
                  <Link
                    href={`/register/runner?distance=${encodeURIComponent(race.distance)}`}
                    className="group flex items-center justify-between text-[#4B5563] hover:text-[#E31B23] transition-colors"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">
                      {race.label}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 text-[#C78A12]">
                      {race.tag}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: ECOSYSTEM & PORTALS (Cols 7-9) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#111827] font-barlow text-sm">
              Ecosystem & Portals
            </h4>
            <div className="w-8 h-[2px] bg-[#E31B23]" />

            <ul className="space-y-2 pt-1">
              {portalLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[#4B5563] hover:text-[#E31B23] transition-colors inline-block hover:translate-x-1 duration-150"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: HOST CITY & SUPPORT (Cols 10-12) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#111827] font-barlow text-sm">
              Event Helpdesk
            </h4>
            <div className="w-8 h-[2px] bg-[#E31B23]" />

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex items-start gap-2 text-[#4B5563]">
                <FaMapMarkerAlt className="text-[#E31B23] text-sm shrink-0 mt-0.5" />
                <span>Rajgir, Nalanda District, Bihar, India</span>
              </div>

              <div className="flex items-start gap-2 text-[#4B5563]">
                <FaEnvelope className="text-[#C78A12] text-sm shrink-0 mt-0.5" />
                <a
                  href="mailto:rajgirmarathon@gmail.com"
                  className="hover:text-[#E31B23] transition-colors break-all"
                >
                  rajgirmarathon@gmail.com
                </a>
              </div>

              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-block px-3.5 py-1.5 rounded-lg border border-[#D1D5DB] bg-white hover:bg-gray-50 text-[#111827] font-bold text-[11px] uppercase tracking-wider transition-all shadow-sm"
                >
                  Contact Organizers
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. BOTTOM COPYRIGHT & SOCIAL STRIP */}
      <div className="border-t border-[#E5E7EB] bg-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p className="text-[#6B7280] text-center sm:text-left">
            © {currentYear} Rajgir Marathon Digital Platform. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-[#6B7280]">
            <Link href="/contact" className="hover:text-[#111827] transition-colors">
              Support
            </Link>
            <span>•</span>
            <Link href="/register/runner" className="hover:text-[#111827] transition-colors">
              Runner Registration
            </Link>
            <span>•</span>
            <Link href="/coming-soon" className="text-[#C78A12] hover:underline">
              Public Coming Soon
            </Link>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-2.5">
            <a
              href="https://www.instagram.com/rajgirmarathon"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[#E31B23] hover:text-white flex items-center justify-center text-[#4B5563] transition-all"
            >
              <FaInstagram />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[#E31B23] hover:text-white flex items-center justify-center text-[#4B5563] transition-all"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="X (Twitter)"
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[#E31B23] hover:text-white flex items-center justify-center text-[#4B5563] transition-all"
            >
              <FaXTwitter />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[#E31B23] hover:text-white flex items-center justify-center text-[#4B5563] transition-all"
            >
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

