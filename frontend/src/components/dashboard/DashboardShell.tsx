"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuChevronsLeft, LuChevronsRight, LuMenu, LuSearch, LuX } from "react-icons/lu";
import { cn } from "@/components/ui";
import { AvatarMenu } from "@/components/layout/AvatarMenu";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useSearch } from "@/components/search/SearchContext";
import { JourneyTracker } from "@/components/flow/JourneyTracker";
import { MobileBottomBar } from "@/components/dashboard/MobileBottomBar";
import { NAV_ICONS, type NavIconKey } from "@/lib/navigation/icons";
import type { Journey, JourneyProgress, Shortcut } from "@/lib/navigation";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: NavIconKey;
  /** Sidebar section heading; a new heading is drawn whenever the group changes. */
  group?: string;
}

const COLLAPSE_KEY = "rajgir_sidebar_collapsed";

/** `exact`: the href is the parent of other sidebar entries (an overview page), so only an exact match is active. */
function isActive(pathname: string, href: string, exact: boolean) {
  if (href === "/") return pathname === "/";
  if (href.includes("#")) return false;
  if (exact || href === "/dashboard" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({
  items,
  pathname,
  onNavigate,
  collapsed = false,
}: {
  items: DashboardNavItem[];
  pathname: string;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  return (
    <nav aria-label="Dashboard">
      <ul className="space-y-1">
        {items.map((item, index) => {
          const showHeading = item.group && item.group !== items[index - 1]?.group;
          const Icon = NAV_ICONS[item.icon];
          const exact = items.some((other) => other.href !== item.href && other.href.startsWith(`${item.href}/`));
          const active = isActive(pathname, item.href, exact);
          return (
            <li key={item.href}>
              {showHeading && !collapsed ? (
                <p className={cn("px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-charcoal-400", index > 0 && "mt-4")}>{item.group}</p>
              ) : showHeading && index > 0 ? (
                <hr className="my-2 border-charcoal-100" />
              ) : null}
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                aria-label={collapsed ? item.label : undefined}
                className={cn(
                  "group/item relative flex min-h-11 items-center gap-3 rounded-btn text-sm font-semibold transition-colors",
                  collapsed ? "justify-center px-0" : "px-3",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red",
                  active ? "bg-brand-red-light text-brand-red-dark" : "text-charcoal-700 hover:bg-charcoal-100"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {collapsed ? (
                  <span className="pointer-events-none absolute left-full z-50 ml-2 hidden whitespace-nowrap rounded-md bg-charcoal-900 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg group-hover/item:block group-focus-visible/item:block">
                    {item.label}
                  </span>
                ) : (
                  item.label
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center rounded-btn focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/rajgir_new_logo.png" alt="Rajgir Marathon" className={cn("w-auto object-contain", compact ? "h-8" : "h-9")} />
    </Link>
  );
}

/**
 * Shared shell for role dashboards and the admin console: collapsible sidebar (248px / 76px), 68px top bar with
 * search, notifications and account menu, optional journey tracker, mobile drawer and mobile bottom tab bar.
 */
export function DashboardShell({
  items,
  userName,
  role,
  status,
  logoutForm,
  title = "Participant dashboard",
  footerText = "Rajgir Marathon 2027 | Official participant portal | 1 user = 1 role policy enforced",
  bottomTabs,
  journey,
  progress,
  audience,
  children,
}: {
  items: DashboardNavItem[];
  userName: string;
  role?: string | null;
  status?: string;
  /** Legacy logout slot; the account menu already contains Log out. */
  logoutForm?: ReactNode;
  title?: string;
  footerText?: string;
  /** Four shortcuts for the mobile bottom bar; a fifth "Menu" tab opens the drawer. */
  bottomTabs?: Shortcut[];
  journey?: Journey | null;
  progress?: JourneyProgress | null;
  audience?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { open: openSearch } = useSearch();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(COLLAPSE_KEY) === "1") setCollapsed(true);
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !c;
    });
  };

  return (
    <div className="min-h-screen bg-surface-soft text-charcoal-900">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-charcoal-200 bg-white transition-[width] duration-200 lg:flex",
          collapsed ? "w-[76px]" : "w-[248px]"
        )}
      >
        <div className={cn("flex h-[68px] items-center border-b border-charcoal-200", collapsed ? "justify-center px-2" : "px-5")}>
          <Logo compact={collapsed} />
        </div>
        <div className={cn("flex-1 overflow-y-auto overflow-x-visible p-4", collapsed && "px-2")}>
          <NavList items={items} pathname={pathname} collapsed={collapsed} />
        </div>
        <div className="border-t border-charcoal-200 p-3">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            className={cn(
              "flex min-h-10 w-full items-center gap-2 rounded-btn text-xs font-semibold text-charcoal-500 hover:bg-charcoal-100",
              collapsed ? "justify-center" : "px-3"
            )}
          >
            {collapsed ? <LuChevronsRight className="h-4 w-4" aria-hidden /> : <LuChevronsLeft className="h-4 w-4" aria-hidden />}
            {collapsed ? null : "Collapse"}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 h-full w-full cursor-default bg-charcoal-900/40"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard menu"
            className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col bg-white"
          >
            <div className="flex h-[68px] items-center justify-between border-b border-charcoal-200 px-4">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-btn text-charcoal-700 hover:bg-charcoal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-red"
              >
                <LuX className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <NavList items={items} pathname={pathname} onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}

      <div className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-[76px]" : "lg:pl-[248px]")}>
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between gap-3 border-b border-charcoal-200 bg-white px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="flex h-11 w-11 items-center justify-center rounded-btn text-charcoal-700 hover:bg-charcoal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-red lg:hidden"
            >
              <LuMenu className="h-5 w-5" aria-hidden />
            </button>
            <div className="lg:hidden">
              <Logo />
            </div>
            <p className="hidden font-barlow text-xl font-bold text-charcoal-900 lg:block">{title}</p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search (Ctrl K)"
              className="hidden h-10 w-56 items-center gap-2 rounded-full border border-charcoal-200 bg-white px-3.5 text-sm text-charcoal-500 hover:border-charcoal-300 md:inline-flex"
            >
              <LuSearch className="h-4 w-4" aria-hidden />
              <span className="flex-1 text-left">Search</span>
              <kbd className="rounded border border-charcoal-200 bg-surface-soft px-1.5 text-[10px] font-semibold">Ctrl K</kbd>
            </button>
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal-600 hover:bg-charcoal-100 md:hidden"
            >
              <LuSearch className="h-5 w-5" aria-hidden />
            </button>
            <NotificationBell role={role} />
            <AvatarMenu name={userName} role={role} status={status} />
            {logoutForm}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] p-4 pb-28 lg:p-8 lg:pb-8">
          {journey && progress && audience ? <JourneyTracker journey={journey} progress={progress} audience={audience} /> : null}
          {children}
        </main>
        <footer className="border-t border-charcoal-200 px-4 py-4 pb-24 text-center text-xs text-charcoal-500 lg:px-8 lg:pb-4">{footerText}</footer>
      </div>

      {bottomTabs && bottomTabs.length > 0 ? <MobileBottomBar tabs={bottomTabs} pathname={pathname} onMenu={() => setOpen(true)} /> : null}
    </div>
  );
}
