"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LuAward,
  LuBookOpen,
  LuClipboardCheck,
  LuClipboardList,
  LuClock,
  LuFootprints,
  LuHouse,
  LuIdCard,
  LuLayoutDashboard,
  LuLifeBuoy,
  LuMegaphone,
  LuMenu,
  LuReceipt,
  LuShieldAlert,
  LuSiren,
  LuSparkles,
  LuTimer,
  LuUserRound,
  LuX,
} from "react-icons/lu";
import { Badge, cn } from "@/components/ui";

const ICONS = {
  overview: LuLayoutDashboard,
  registration: LuClipboardList,
  help: LuLifeBuoy,
  home: LuHouse,
  bib: LuIdCard,
  splits: LuTimer,
  medical: LuShieldAlert,
  training: LuFootprints,
  certificate: LuAward,
  invoice: LuReceipt,
  shift: LuClock,
  badge: LuIdCard,
  checklist: LuClipboardCheck,
  incidents: LuShieldAlert,
  sop: LuBookOpen,
  sos: LuSiren,
  profile: LuUserRound,
  deliverables: LuClipboardCheck,
  brand: LuSparkles,
  pass: LuIdCard,
  media: LuMegaphone,
} as const;

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.includes("#")) return false;
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/dashboard/runner") return pathname === "/dashboard/runner";
  if (href === "/dashboard/volunteer") return pathname === "/dashboard/volunteer";
  if (href === "/dashboard/influencer") return pathname === "/dashboard/influencer";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({ items, pathname, onNavigate }: { items: DashboardNavItem[]; pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Dashboard">
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-btn px-3 text-sm font-semibold transition-colors",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red",
                  active ? "bg-brand-red-light text-brand-red-dark" : "text-charcoal-700 hover:bg-charcoal-100"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center rounded-btn focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/rajgir_new_logo.png" alt="Rajgir Marathon" className="h-9 w-auto object-contain" />
    </Link>
  );
}

export function DashboardShell({
  items,
  userName,
  roleLabel,
  logoutForm,
  children,
}: {
  items: DashboardNavItem[];
  userName: string;
  roleLabel: string;
  logoutForm: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-screen bg-surface-soft text-charcoal-900">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-charcoal-200 bg-white lg:flex">
        <div className="flex h-[68px] items-center border-b border-charcoal-200 px-5">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <NavList items={items} pathname={pathname} />
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

      <div className="lg:pl-[248px]">
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
            <p className="hidden font-barlow text-xl font-bold text-charcoal-900 lg:block">Participant dashboard</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-charcoal-100 text-charcoal-600">
                <LuUserRound className="h-5 w-5" aria-hidden />
              </span>
              <div className="hidden min-w-0 sm:block">
                <p className="max-w-[180px] truncate text-sm font-semibold leading-tight text-charcoal-900">{userName}</p>
                <Badge tone="brand" className="mt-1">
                  {roleLabel}
                </Badge>
              </div>
            </div>
            {logoutForm}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] p-4 lg:p-8">{children}</main>
        <footer className="border-t border-charcoal-200 px-4 py-4 text-center text-xs text-charcoal-500 lg:px-8">
          Rajgir Marathon 2027 | Official participant portal | 1 user = 1 role policy enforced
        </footer>
      </div>
    </div>
  );
}
