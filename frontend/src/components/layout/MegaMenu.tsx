"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuArrowRight, LuChevronDown } from "react-icons/lu";
import { AUDIENCES, AUDIENCE_GROUPS, MEGA_MENUS } from "@/lib/navigation";
import type { MegaLink, MegaMenu as MegaMenuData } from "@/lib/navigation";
import { NAV_ICONS } from "@/lib/navigation/icons";
import { useDismiss } from "./useDismiss";

const STATUS_DOT: Record<MegaLink["status"], string> = { live: "bg-emerald-500", partial: "bg-amber-400", planned: "bg-[#D1D5DB]" };
const STATUS_TEXT: Record<MegaLink["status"], string> = { live: "Live", partial: "In progress", planned: "Planned" };

const baseOf = (href: string) => href.split("#")[0].split("?")[0];

function menuIsActive(menu: MegaMenuData, pathname: string): boolean {
  const hrefs = menu.audiences
    ? ["/register", "/how-it-works"]
    : menu.columns.flatMap((c) => c.links.map((l) => baseOf(l.href))).filter((h) => h && h !== "/");
  return hrefs.some((h) => pathname === h || pathname.startsWith(`${h}/`));
}

/** Desktop main navigation (header row 2): one mega menu per journey stage, driven by lib/navigation/megaMenu.ts. */
export function MegaNav() {
  const pathname = usePathname();
  const [openId, setOpenId] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const close = useCallback(() => setOpenId(null), []);
  useDismiss(openId !== null, close, wrapRef);

  useEffect(() => {
    // A navigation always closes the open menu.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenId(null);
  }, [pathname]);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const open = (id: string) => {
    cancelClose();
    setOpenId(id);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenId(null), 140);
  };

  const current = MEGA_MENUS.find((m) => m.id === openId) ?? null;

  return (
    <div ref={wrapRef} onMouseLeave={scheduleClose} onMouseEnter={cancelClose} className="static">
      <nav aria-label="Main" className="flex items-center gap-0.5 2xl:gap-1.5">
        {MEGA_MENUS.map((menu) => {
          const active = menuIsActive(menu, pathname);
          const isOpen = openId === menu.id;
          return (
            <button
              key={menu.id}
              type="button"
              id={`mega-trigger-${menu.id}`}
              aria-expanded={isOpen}
              aria-controls={`mega-panel-${menu.id}`}
              onMouseEnter={() => open(menu.id)}
              onFocus={() => open(menu.id)}
              onClick={() => (isOpen ? close() : open(menu.id))}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  open(menu.id);
                  requestAnimationFrame(() => document.querySelector<HTMLElement>(`#mega-panel-${menu.id} a`)?.focus());
                }
              }}
              className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-2 text-[11px] font-bold uppercase tracking-wide font-manrope transition-colors 2xl:px-2.5 2xl:text-xs 2xl:tracking-wider ${
                isOpen || active ? "text-[#E31B23]" : "text-[#4B5563] hover:text-[#111827]"
              } ${isOpen ? "bg-red-50" : ""}`}
            >
              {menu.label}
              <LuChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
            </button>
          );
        })}
      </nav>

      {current ? (
        <div
          id={`mega-panel-${current.id}`}
          role="region"
          aria-labelledby={`mega-trigger-${current.id}`}
          className="absolute inset-x-0 top-full z-40 border-b border-t border-[#E5E7EB] bg-white shadow-[0_18px_40px_rgba(17,24,39,0.12)]"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-12 gap-8 px-4 py-7 sm:px-6 lg:px-8">
            <div className="col-span-3 flex flex-col">
              <h3 className="font-barlow text-2xl font-bold uppercase text-[#111827]">{current.label}</h3>
              <p className="mt-1 text-sm text-[#6B7280]">{current.blurb}</p>
              <Link
                href={current.featured.href}
                className="group mt-5 rounded-xl border border-[#F3DFA8] bg-[#FFF9EF] p-4 transition-shadow hover:shadow-md"
              >
                <p className="text-sm font-bold text-[#111827]">{current.featured.title}</p>
                <p className="mt-1 text-xs text-[#6B7280]">{current.featured.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-[#E31B23]">
                  {current.featured.cta}
                  <LuArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </div>

            <div className="col-span-9">
              {current.audiences ? (
                <div className="grid grid-cols-4 gap-6">
                  {AUDIENCE_GROUPS.map((group) => (
                    <div key={group}>
                      <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-[#9CA3AF]">{group}</p>
                      <ul className="space-y-1">
                        {AUDIENCES.filter((a) => a.group === group).map((a) => {
                          const Icon = NAV_ICONS[a.icon];
                          return (
                            <li key={a.id}>
                              <Link href={`/how-it-works/${a.id}`} className="group flex items-start gap-3 rounded-lg p-2 hover:bg-[#F9FAFB]">
                                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FEF2F2] text-[#E31B23]">
                                  <Icon className="h-5 w-5" aria-hidden />
                                </span>
                                <span className="min-w-0">
                                  <span className="block text-sm font-bold text-[#111827] group-hover:text-[#E31B23]">{a.title}</span>
                                  <span className="block text-xs leading-snug text-[#6B7280]">{a.tagline}</span>
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`grid gap-8 ${current.columns.length >= 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                  {current.columns.map((col) => (
                    <div key={col.title}>
                      <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-[#9CA3AF]">{col.title}</p>
                      <ul className="space-y-0.5">
                        {col.links.map((l) => {
                          const Icon = NAV_ICONS[l.icon];
                          return (
                            <li key={`${l.href}|${l.title}`}>
                              <Link href={l.href} className="group flex items-start gap-3 rounded-lg p-2 hover:bg-[#F9FAFB]">
                                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#4B5563] group-hover:bg-[#FEF2F2] group-hover:text-[#E31B23]">
                                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-[#111827] group-hover:text-[#E31B23]">{l.title}</span>
                                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[l.status]}`} title={STATUS_TEXT[l.status]} aria-label={STATUS_TEXT[l.status]} />
                                  </span>
                                  <span className="block text-xs leading-snug text-[#6B7280]">{l.description}</span>
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
