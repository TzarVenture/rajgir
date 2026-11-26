"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LuCalendarDays, LuLanguages, LuMail } from "react-icons/lu";
import { EVENT, IST_OFFSET } from "@/lib/event";
import { UTILITY_LINKS } from "@/lib/navigation";
import { AvatarMenu } from "./AvatarMenu";
import { NotificationBell } from "./NotificationBell";
import type { HeaderUser } from "./HeaderAuth";

const LANG_KEY = "rajgir_lang";

function daysToRace(): number | null {
  const race = new Date(`${EVENT.raceDate}T00:00:00${IST_OFFSET}`).getTime();
  const days = Math.ceil((race - Date.now()) / 86_400_000);
  return days;
}

/**
 * Header row 1 (desktop): countdown, help, quick links, language and the account area. Search lives in the main bar.
 * Language switch is a UI preference only for now; translated content is not built yet.
 */
export function UtilityBar({ user }: { user: HeaderUser | null }) {
  const [days, setDays] = useState<number | null>(null);
  const [lang, setLang] = useState<"en" | "hi">("en");

  useEffect(() => {
    // Client-only values (current time, saved preference) are read after mount to keep server and client HTML identical.
    /* eslint-disable react-hooks/set-state-in-effect */
    setDays(daysToRace());
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "hi" || saved === "en") setLang(saved);
    } catch {
      /* storage unavailable */
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const pick = (next: "en" | "hi") => {
    setLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="hidden border-b border-[#E5E7EB] bg-[#F8F8F6] xl:block">
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between gap-4 px-4 text-xs sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 text-[#4B5563]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[#111827]">
            <LuCalendarDays className="h-4 w-4 text-[#C78A12]" aria-hidden />
            {days !== null && days > 0 ? `${days} days to race day` : days === 0 ? "Race day is today" : "21 Nov 2027"}
          </span>
          <span className="hidden text-[#D1D5DB] 2xl:inline">|</span>
          <span className="hidden 2xl:inline">Rajgir, Nalanda, Bihar</span>
          <a href={`mailto:${EVENT.contacts.helpEmail}`} className="hidden items-center gap-1.5 hover:text-[#E31B23] 2xl:inline-flex">
            <LuMail className="h-4 w-4" aria-hidden />
            {EVENT.contacts.helpEmail}
          </a>
        </div>

        <div className="flex items-center gap-4">
          <nav aria-label="Quick links" className="flex items-center gap-4 font-semibold text-[#4B5563]">
            {UTILITY_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-[#E31B23]">
                {l.title}
              </Link>
            ))}
          </nav>

          <div className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white p-0.5" role="group" aria-label="Language">
            <LuLanguages className="ml-1.5 h-3.5 w-3.5 text-[#6B7280]" aria-hidden />
            <button type="button" onClick={() => pick("en")} aria-pressed={lang === "en"} className={`rounded-full px-2 py-0.5 font-bold ${lang === "en" ? "bg-[#111827] text-white" : "text-[#4B5563]"}`}>
              EN
            </button>
            <button
              type="button"
              onClick={() => pick("hi")}
              aria-pressed={lang === "hi"}
              title="Hindi content is coming soon"
              className={`rounded-full px-2 py-0.5 font-bold ${lang === "hi" ? "bg-[#111827] text-white" : "text-[#4B5563]"}`}
            >
              हिं
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-1">
              <NotificationBell role={user.role} />
              <AvatarMenu name={user.name} role={user.role} status={user.status} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
