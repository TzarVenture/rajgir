"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { Badge } from "@/components/ui";
import type { BadgeTone } from "@/components/ui";
import { roleLabel } from "@/lib/auth/roles";
import { ADMIN_QUICK_ACTIONS, AUDIENCES, QUICK_ACTIONS, ROLE_KEY, audienceForRole } from "@/lib/navigation";
import { NAV_ICONS } from "@/lib/navigation/icons";
import { useDismiss } from "./useDismiss";

const STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  ACTIVE: { label: "Active", tone: "success" },
  PENDING_APPROVAL: { label: "Pending approval", tone: "warning" },
  PENDING_ONBOARDING: { label: "Registration incomplete", tone: "warning" },
  SUSPENDED: { label: "Suspended", tone: "error" },
};

const STAFF = new Set(["ORGANIZER", "SUPER_ADMIN"]);

function Ico({ name, className = "h-5 w-5 text-charcoal-500" }: { name: keyof typeof NAV_ICONS; className?: string }) {
  const Icon = NAV_ICONS[name];
  return <Icon className={className} aria-hidden />;
}

/**
 * Account menu: who you are, a role-based "Manage" group, your journey, other ways to take part and log out.
 * One account has one role, so unlike a multi-role product this never offers a second registration.
 */
export function AvatarMenu({
  name,
  role,
  status,
  align = "right",
  compact = false,
}: {
  name: string;
  role?: string | null;
  status?: string;
  align?: "left" | "right";
  /** Icon-only trigger (mobile). */
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, ref);

  const isStaff = role ? STAFF.has(role) : false;
  const roleKey = role ? ROLE_KEY[role] : undefined;
  const audience = audienceForRole(role);
  const actions = isStaff ? ADMIN_QUICK_ACTIONS : roleKey ? QUICK_ACTIONS[roleKey] : [];
  const home = isStaff ? "/admin/dashboard" : "/dashboard";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  const st = status ? STATUS[status] : undefined;
  const others = AUDIENCES.filter((a) => a.id !== audience && ["volunteer", "sponsor", "visitor", "runner"].includes(a.id)).slice(0, 3);

  const item = "flex items-center gap-3 rounded-btn px-3 py-2 text-sm font-medium text-charcoal-700 hover:bg-charcoal-100 hover:text-charcoal-900";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className={`flex items-center gap-2 rounded-full border border-charcoal-200 bg-white py-1 pl-1 hover:bg-charcoal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-red ${compact ? "pr-1" : "pr-3"}`}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-red text-xs font-bold text-white">{initials || "U"}</span>
        {!compact ? <span className="hidden max-w-[110px] truncate text-xs font-bold text-charcoal-800 xl:block">{name.split(" ")[0]}</span> : null}
      </button>

      {open ? (
        <div
          role="menu"
          className={`absolute top-full z-[60] mt-2 w-72 rounded-feature border border-charcoal-200 bg-white p-2 shadow-[0_12px_32px_rgba(17,24,39,0.16)] ${align === "right" ? "right-0" : "left-0"}`}
        >
          <div className="flex items-center gap-3 rounded-btn bg-surface-soft p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-red text-sm font-bold text-white">{initials || "U"}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-charcoal-900">{name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge tone="brand">{roleLabel(role)}</Badge>
                {st ? <Badge tone={st.tone}>{st.label}</Badge> : null}
              </div>
            </div>
          </div>

          <div className="mt-2 space-y-0.5">
            <Link href={home} role="menuitem" onClick={close} className={item}>
              <Ico name="overview" />
              {isStaff ? "Admin console" : "My dashboard"}
            </Link>
          </div>

          {actions.length > 0 ? (
            <div className="mt-2 border-t border-charcoal-100 pt-2">
              <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-charcoal-400">Manage</p>
              {actions.map((a) => {
                return (
                  <Link key={a.href} href={a.href} role="menuitem" onClick={close} className={item}>
                    <Ico name={a.icon} />
                    {a.label}
                  </Link>
                );
              })}
            </div>
          ) : null}

          <div className="mt-2 border-t border-charcoal-100 pt-2">
            <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-charcoal-400">Help & flow</p>
            {audience ? (
              <Link href={`/how-it-works/${audience}`} role="menuitem" onClick={close} className={item}>
                <Ico name="flow" />
                My journey, step by step
              </Link>
            ) : null}
            <Link href="/contact" role="menuitem" onClick={close} className={item}>
              <Ico name="help" />
              Support
            </Link>
          </div>

          {!isStaff && others.length > 0 ? (
            <div className="mt-2 border-t border-charcoal-100 pt-2">
              <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-charcoal-400">Other ways to take part</p>
              {others.map((a) => {
                return (
                  <Link key={a.id} href={`/how-it-works/${a.id}`} role="menuitem" onClick={close} className={item}>
                    <Ico name={a.icon} />
                    {a.title}
                  </Link>
                );
              })}
              <p className="px-3 pt-1 text-[11px] leading-snug text-charcoal-400">Each account has one role. Use another email to register in a different role.</p>
            </div>
          ) : null}

          <form action={logout} className="mt-2 border-t border-charcoal-100 pt-2">
            <button type="submit" role="menuitem" className={`${item} w-full text-left text-charcoal-600 hover:text-brand-red`}>
              <Ico name="logout" className="h-5 w-5" />
              Log out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
