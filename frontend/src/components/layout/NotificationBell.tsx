"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { LuBell, LuBellOff } from "react-icons/lu";
import { ROLE_KEY } from "@/lib/navigation";
import { useDismiss } from "./useDismiss";

const TABS = ["All", "Race", "Payments", "System"] as const;

/**
 * Notification dropdown. UI shell only: there is no notification service yet, so it always shows the
 * empty state and links to the role's Notifications page. Wire `items` to the API when it exists.
 */
export function NotificationBell({ role, align = "right" }: { role?: string | null; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, ref);

  const roleKey = role ? ROLE_KEY[role] : undefined;
  const all = role === "ORGANIZER" || role === "SUPER_ADMIN" ? "/admin/notifications" : roleKey ? `/dashboard/${roleKey}/notifications` : "/dashboard";
  const items: { id: string; title: string; time: string; tab: (typeof TABS)[number]; href: string }[] = [];
  const visible = items.filter((i) => tab === "All" || i.tab === tab);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={items.length ? `Notifications, ${items.length} new` : "Notifications"}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-charcoal-600 hover:bg-charcoal-100 hover:text-charcoal-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-red"
      >
        <LuBell className="h-5 w-5" aria-hidden />
        {items.length > 0 ? <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-brand-red ring-2 ring-white" aria-hidden /> : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className={`absolute top-full z-[60] mt-2 w-80 max-w-[calc(100vw-1.5rem)] rounded-feature border border-charcoal-200 bg-white shadow-[0_12px_32px_rgba(17,24,39,0.16)] ${align === "right" ? "right-0" : "left-0"}`}
        >
          <div className="flex items-center justify-between border-b border-charcoal-100 px-4 py-3">
            <p className="text-sm font-bold text-charcoal-900">Notifications</p>
            <button type="button" disabled className="text-xs font-semibold text-charcoal-400" title="Nothing to mark yet">
              Mark all read
            </button>
          </div>
          <div className="flex gap-1 border-b border-charcoal-100 px-3 py-2" role="tablist">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${tab === t ? "bg-brand-red-light text-brand-red-dark" : "text-charcoal-600 hover:bg-charcoal-100"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-8 text-center">
                <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-charcoal-100 text-charcoal-500">
                  <LuBellOff className="h-5 w-5" aria-hidden />
                </span>
                <p className="text-sm font-semibold text-charcoal-900">You are all caught up</p>
                <p className="mt-1 text-xs text-charcoal-500">Race updates, payment receipts and approvals will appear here.</p>
              </div>
            ) : (
              visible.map((n) => (
                <Link key={n.id} href={n.href} onClick={close} className="block border-b border-charcoal-100 px-4 py-3 text-sm hover:bg-charcoal-50">
                  <span className="block font-semibold text-charcoal-900">{n.title}</span>
                  <span className="text-xs text-charcoal-500">{n.time}</span>
                </Link>
              ))
            )}
          </div>
          <Link href={all} onClick={close} className="block border-t border-charcoal-100 px-4 py-3 text-center text-xs font-bold text-brand-red hover:bg-charcoal-50">
            View all notifications
          </Link>
        </div>
      ) : null}
    </div>
  );
}
