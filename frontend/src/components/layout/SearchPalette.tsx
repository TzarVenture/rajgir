"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LuCornerDownLeft, LuSearch, LuX } from "react-icons/lu";
import { Badge } from "@/components/ui";
import { AUDIENCES } from "@/lib/navigation/audiences";
import { NAV_ICONS } from "@/lib/navigation/icons";
import { POPULAR_SEARCHES, buildSearchIndex, searchEntries } from "@/lib/navigation/search";
import type { SearchEntry } from "@/lib/navigation/search";

const GROUP_ORDER: SearchEntry["group"][] = ["My dashboard", "Guides & journeys", "Pages"];

/**
 * Global search: find any page, guide or dashboard screen by name. Built from the navigation registry,
 * opened with the search pill or Ctrl/Cmd+K. Arrow keys move, Enter opens, Esc closes.
 */
export function SearchPalette({ open, onClose, role }: { open: boolean; onClose: () => void; role?: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const index = useMemo(() => buildSearchIndex(role), [role]);
  const results = useMemo(() => searchEntries(index, query), [index, query]);
  // Flat, grouped order so arrow keys follow what the user sees.
  const ordered = useMemo(() => GROUP_ORDER.flatMap((g) => results.filter((r) => r.group === g)), [results]);
  const showPopular = query.trim() === "";

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = original;
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const go = (href: string) => {
    onClose();
    setQuery("");
    router.push(href);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const count = showPopular ? POPULAR_SEARCHES.length : ordered.length;
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((a) => (count ? (a + 1) % count : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((a) => (count ? (a - 1 + count) % count : 0));
    } else if (event.key === "Enter") {
      const target = showPopular ? POPULAR_SEARCHES[active] : ordered[active];
      if (target) go(target.href);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-charcoal-900/50 px-3 pt-[8vh] sm:pt-[12vh]" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search Rajgir Marathon"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
        className="w-full max-w-xl overflow-hidden rounded-feature bg-white shadow-[0_16px_40px_rgba(17,24,39,0.22)]"
      >
        <div className="flex items-center gap-3 border-b border-charcoal-200 px-4">
          <LuSearch className="h-5 w-5 shrink-0 text-charcoal-400" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            placeholder="Search races, hotels, volunteer, results, my bib…"
            className="h-14 w-full bg-transparent text-[15px] text-charcoal-900 outline-none placeholder:text-charcoal-400"
          />
          <button type="button" onClick={onClose} aria-label="Close search" className="flex h-9 w-9 items-center justify-center rounded-btn text-charcoal-500 hover:bg-charcoal-100">
            <LuX className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div id={listId} role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
          {showPopular ? (
            <>
              <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-charcoal-400">Popular</p>
              {POPULAR_SEARCHES.map((p, i) => {
                const Icon = NAV_ICONS[p.icon];
                return (
                  <Link
                    key={p.href}
                    href={p.href}
                    role="option"
                    aria-selected={i === active}
                    onClick={onClose}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-semibold ${i === active ? "bg-brand-red-light text-brand-red-dark" : "text-charcoal-800"}`}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden />
                    {p.title}
                  </Link>
                );
              })}
              <p className="px-3 pb-1 pt-4 text-[11px] font-bold uppercase tracking-wider text-charcoal-400">I am a…</p>
              <div className="flex flex-wrap gap-2 px-3 pb-2">
                {AUDIENCES.map((a) => (
                  <Link
                    key={a.id}
                    href={`/how-it-works/${a.id}`}
                    onClick={onClose}
                    className="rounded-full border border-charcoal-200 bg-white px-3 py-1.5 text-xs font-semibold text-charcoal-700 hover:border-brand-red hover:text-brand-red"
                  >
                    {a.title}
                  </Link>
                ))}
              </div>
              <p className="px-3 pb-2 pt-1 text-xs text-charcoal-500">
                Try: <span className="font-semibold text-charcoal-700">bib pass</span>, <span className="font-semibold text-charcoal-700">hotels</span>,{" "}
                <span className="font-semibold text-charcoal-700">volunteer</span>, <span className="font-semibold text-charcoal-700">results</span>. Tip: press{" "}
                <kbd className="rounded border border-charcoal-200 bg-surface-soft px-1.5 text-[10px] font-semibold">Ctrl K</kbd> on any page.
              </p>
            </>
          ) : ordered.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-charcoal-500">
              No results for <span className="font-semibold text-charcoal-800">&ldquo;{query}&rdquo;</span>. Try &ldquo;register&rdquo;, &ldquo;hotel&rdquo; or &ldquo;results&rdquo;.
            </div>
          ) : (
            GROUP_ORDER.map((group) => {
              const items = ordered.filter((r) => r.group === group);
              if (!items.length) return null;
              return (
                <div key={group}>
                  <p className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-charcoal-400">{group}</p>
                  {items.map((r) => {
                    const i = ordered.indexOf(r);
                    const Icon = r.icon ? NAV_ICONS[r.icon] : null;
                    return (
                      <Link
                        key={`${r.href}|${r.title}`}
                        href={r.href}
                        role="option"
                        aria-selected={i === active}
                        onClick={onClose}
                        onMouseEnter={() => setActive(i)}
                        className={`flex items-start gap-3 rounded-btn px-3 py-2.5 ${i === active ? "bg-brand-red-light" : ""}`}
                      >
                        {Icon ? <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${i === active ? "text-brand-red" : "text-charcoal-500"}`} aria-hidden /> : null}
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-charcoal-900">{r.title}</span>
                            {r.status && r.status !== "live" ? <Badge tone={r.status === "partial" ? "warning" : "neutral"}>{r.status === "partial" ? "In progress" : "Planned"}</Badge> : null}
                          </span>
                          {r.description ? <span className="block truncate text-xs text-charcoal-500">{r.description}</span> : null}
                        </span>
                        {i === active ? <LuCornerDownLeft className="mt-1 h-4 w-4 shrink-0 text-charcoal-400" aria-hidden /> : null}
                      </Link>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
        <div className="hidden items-center gap-4 border-t border-charcoal-200 bg-surface-soft px-4 py-2 text-[11px] text-charcoal-500 sm:flex">
          <span>↑↓ to move</span>
          <span>Enter to open</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}
