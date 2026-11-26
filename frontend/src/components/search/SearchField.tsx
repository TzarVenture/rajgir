"use client";

import Link from "next/link";
import { LuSearch } from "react-icons/lu";
import { useSearch } from "./SearchContext";

const CHIPS: { title: string; href: string }[] = [
  { title: "Register as a runner", href: "/register/runner" },
  { title: "Race categories", href: "/#categories" },
  { title: "Hotels & travel", href: "/tourism" },
  { title: "Volunteer", href: "/register/volunteer" },
  { title: "How it works", href: "/how-it-works" },
  { title: "Results", href: "/results" },
];

/**
 * Big, obvious search box for landing pages. It looks like an input but opens the shared search palette
 * (so results, keyboard navigation and role-aware dashboard results stay in one place), with one-tap shortcuts below.
 */
export function SearchField({ className = "", showChips = true }: { className?: string; showChips?: boolean }) {
  const { open } = useSearch();
  return (
    <section aria-label="Search" className={`mx-auto w-full max-w-2xl ${className}`}>
      <button
        type="button"
        onClick={open}
        aria-label="Search the Rajgir Marathon site"
        className="flex h-14 w-full items-center gap-3 rounded-full border border-[#D1D5DB] bg-white px-5 text-left text-[15px] text-[#6B7280] shadow-[0_4px_16px_rgba(17,24,39,0.08)] transition-shadow hover:border-[#9CA3AF] hover:shadow-[0_6px_20px_rgba(17,24,39,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E31B23]"
      >
        <LuSearch className="h-5 w-5 shrink-0 text-[#E31B23]" aria-hidden />
        <span className="min-w-0 flex-1 truncate">What are you looking for? Races, hotels, volunteering, results…</span>
        <kbd className="hidden rounded border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-0.5 text-[11px] font-semibold text-[#6B7280] sm:block">Ctrl K</kbd>
      </button>
      {showChips ? (
        <ul className="mt-3 flex flex-wrap justify-center gap-2" aria-label="Popular searches">
          {CHIPS.map((c) => (
            <li key={c.href + c.title}>
              <Link href={c.href} className="inline-block rounded-full border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#374151] hover:border-[#E31B23] hover:text-[#E31B23]">
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
