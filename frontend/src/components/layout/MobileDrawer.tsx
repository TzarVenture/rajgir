"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LuArrowRight, LuChevronDown, LuLogOut, LuSearch, LuUserRound, LuX } from "react-icons/lu";
import { logout } from "@/app/actions/auth";
import { roleLabel } from "@/lib/auth/roles";
import { AUDIENCES, MEGA_MENUS, UTILITY_LINKS } from "@/lib/navigation";
import { NAV_ICONS } from "@/lib/navigation/icons";
import type { HeaderUser } from "./HeaderAuth";

/**
 * Mobile navigation drawer (slides from the top under the header, like KaamMilega's): account, search,
 * "I am a..." first, then each journey stage as an accordion, then help links and the register button.
 */
export function MobileDrawer({ open, onClose, user, onSearch }: { open: boolean; onClose: () => void; user: HeaderUser | null; onSearch: () => void }) {
  const [section, setSection] = useState<string | null>("participate");

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (id: string) => setSection((s) => (s === id ? null : id));
  const row = "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-[#374151] hover:bg-[#F3F4F6]";

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Site menu">
      <button type="button" aria-label="Close menu" className="absolute inset-0 h-full w-full cursor-default bg-[#111827]/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="absolute inset-x-0 top-0 max-h-full overflow-y-auto overscroll-contain border-b border-[#E5E7EB] bg-white px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 shadow-xl">
        {user ? (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-[#F8F8F6] p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#111827]">{user.name}</p>
              <p className="text-xs text-[#6B7280]">{roleLabel(user.role)}</p>
            </div>
            <Link href={user.role === "ORGANIZER" || user.role === "SUPER_ADMIN" ? "/admin/dashboard" : "/dashboard"} onClick={onClose} className="rounded-lg bg-white px-3 py-2 text-xs font-extrabold uppercase tracking-wider text-[#111827] shadow-sm">
              Dashboard
            </Link>
          </div>
        ) : (
          <Link
            href="/login"
            onClick={onClose}
            className="mb-3 flex h-11 w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-b from-[#F0343C] to-[#CF1018] text-[13px] font-bold text-white transition-colors hover:from-[#E6252D] hover:to-[#B80E15]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white">
              <LuUserRound className="h-[17px] w-[17px]" aria-hidden />
            </span>
            Log in
          </Link>
        )}

        <button
          type="button"
          onClick={() => {
            onClose();
            onSearch();
          }}
          className="mb-3 flex h-11 w-full items-center gap-3 rounded-full border border-[#E5E7EB] bg-white px-4 text-sm text-[#6B7280]"
        >
          <LuSearch className="h-4 w-4" aria-hidden />
          Search the site
        </button>

        <div className="space-y-1">
          {MEGA_MENUS.map((menu) => {
            const MenuIcon = NAV_ICONS[menu.icon];
            const isOpen = section === menu.id;
            return (
              <div key={menu.id} className="rounded-lg">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggle(menu.id)}
                  className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs font-extrabold uppercase tracking-wider ${isOpen ? "bg-red-50 text-[#E31B23]" : "text-[#374151] hover:bg-[#F3F4F6]"}`}
                >
                  <span className="flex items-center gap-3">
                    <MenuIcon className="h-5 w-5" aria-hidden />
                    {menu.audiences ? "I am a… (Participate)" : menu.label}
                  </span>
                  <LuChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                </button>
                {isOpen ? (
                  <div className="mb-2 ml-3 border-l border-[#E5E7EB] pl-2">
                    {menu.audiences
                      ? AUDIENCES.map((a) => {
                          const Icon = NAV_ICONS[a.icon];
                          return (
                            <Link key={a.id} href={`/how-it-works/${a.id}`} onClick={onClose} className={row}>
                              <Icon className="h-5 w-5 shrink-0 text-[#E31B23]" aria-hidden />
                              <span className="min-w-0">
                                <span className="block">{a.title}</span>
                                <span className="block text-xs font-normal text-[#6B7280]">{a.tagline}</span>
                              </span>
                            </Link>
                          );
                        })
                      : menu.columns.flatMap((c) => c.links).map((l) => {
                          const Icon = NAV_ICONS[l.icon];
                          return (
                            <Link key={`${l.href}|${l.title}`} href={l.href} onClick={onClose} className={row}>
                              <Icon className="h-5 w-5 shrink-0 text-[#6B7280]" aria-hidden />
                              {l.title}
                            </Link>
                          );
                        })}
                    <Link href={menu.featured.href} onClick={onClose} className="mt-1 flex min-h-11 items-center gap-2 px-3 text-xs font-extrabold uppercase tracking-wider text-[#E31B23]">
                      {menu.featured.cta}
                      <LuArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#E5E7EB] pt-3">
          {UTILITY_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={onClose} className="rounded-lg bg-[#F9FAFB] py-2.5 text-center text-xs font-bold text-[#4B5563]">
              {l.title}
            </Link>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {user ? (
            <form action={logout}>
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-white py-2.5 text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                <LuLogOut className="h-4 w-4" aria-hidden />
                Log out
              </button>
            </form>
          ) : null}
        </div>

        <button type="button" onClick={onClose} aria-label="Close menu" className="mx-auto mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-[#4B5563]">
          <LuX className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
