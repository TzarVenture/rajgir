"use client";

import Link from "next/link";
import { LuMenu } from "react-icons/lu";
import { cn } from "@/components/ui";
import { NAV_ICONS } from "@/lib/navigation/icons";
import type { Shortcut } from "@/lib/navigation";

/**
 * Mobile bottom tab bar (below lg): four role shortcuts plus a "Menu" tab that opens the full sidebar drawer.
 * Same item data as the sidebar (lib/navigation/roleNav.ts BOTTOM_TABS), so both always agree.
 */
export function MobileBottomBar({ tabs, pathname, onMenu }: { tabs: Shortcut[]; pathname: string; onMenu: () => void }) {
  const isActive = (href: string) => {
    // Overview-style hrefs only match exactly; deeper pages match by prefix.
    const isRoot = tabs.some((t) => t.href !== href && t.href.startsWith(`${href}/`)) || href === "/dashboard/group" || href === "/dashboard/partner" || href === "/admin/dashboard";
    return isRoot ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  };
  const base =
    "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-red";

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-charcoal-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(17,24,39,0.06)] lg:hidden"
    >
      {tabs.map((tab) => {
        const Icon = NAV_ICONS[tab.icon];
        const active = isActive(tab.href);
        return (
          <Link key={tab.href} href={tab.href} aria-current={active ? "page" : undefined} className={cn(base, active ? "text-brand-red" : "text-charcoal-500")}>
            <Icon className="h-5 w-5" aria-hidden />
            {tab.label}
          </Link>
        );
      })}
      <button type="button" onClick={onMenu} className={cn(base, "text-charcoal-500")}>
        <LuMenu className="h-5 w-5" aria-hidden />
        Menu
      </button>
    </nav>
  );
}
