"use client";

import { createContext, useCallback, useContext, useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LuSearch } from "react-icons/lu";
import { Badge, Button, Notice, TextInput, type BadgeTone } from "@/components/ui";

/* ------------------------------------------------------------------------------------------------
 * Action runner: one place for pending state, success / error messages and refreshing server data.
 * Sections render straight from server props; after a successful action router.refresh() reloads
 * them, so lists always show what is in the database (no stale local copies).
 * ---------------------------------------------------------------------------------------------- */

type ActionOutcome = { success: boolean; error?: string };

interface AdminActionApi {
  pending: boolean;
  /** Runs `fn`; on success shows `okMessage` (or the string it returns), calls `onSuccess` and refreshes. */
  run: (fn: () => Promise<ActionOutcome & { message?: string }>, okMessage: string, onSuccess?: () => void) => void;
  /** Like run(), but asks for confirmation first. */
  confirmRun: (question: string, fn: () => Promise<ActionOutcome & { message?: string }>, okMessage: string, onSuccess?: () => void) => void;
  showError: (message: string) => void;
  clear: () => void;
}

const AdminActionContext = createContext<AdminActionApi | null>(null);

export function AdminActionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const clear = useCallback(() => {
    setError("");
    setFeedback("");
  }, []);

  const run = useCallback<AdminActionApi["run"]>(
    (fn, okMessage, onSuccess) => {
      clear();
      startTransition(async () => {
        try {
          const res = await fn();
          if (!res.success) {
            setError(res.error ?? "Action failed. Please try again.");
            return;
          }
          setFeedback(res.message ?? okMessage);
          onSuccess?.();
          router.refresh();
        } catch {
          setError("Could not reach the server. Check your connection and try again.");
        }
      });
    },
    [clear, router],
  );

  const confirmRun = useCallback<AdminActionApi["confirmRun"]>(
    (question, fn, okMessage, onSuccess) => {
      if (window.confirm(question)) run(fn, okMessage, onSuccess);
    },
    [run],
  );

  const api = useMemo<AdminActionApi>(() => ({ pending, run, confirmRun, showError: setError, clear }), [pending, run, confirmRun, clear]);

  return (
    <AdminActionContext.Provider value={api}>
      <div aria-live="polite" className="space-y-2 empty:hidden">
        {error ? <Notice tone="error">{error}</Notice> : null}
        {feedback ? <Notice tone="success">{feedback}</Notice> : null}
      </div>
      {children}
    </AdminActionContext.Provider>
  );
}

export function useAdminAction(): AdminActionApi {
  const ctx = useContext(AdminActionContext);
  if (!ctx) throw new Error("useAdminAction must be used inside <AdminActionProvider>");
  return ctx;
}

/* ------------------------------------------------------------------------------------------------
 * Presentational pieces shared by every section.
 * ---------------------------------------------------------------------------------------------- */

/** Status values used across the admin data, mapped to one consistent badge colour. */
export function statusTone(status: string | null | undefined): BadgeTone {
  const s = (status ?? "").toUpperCase();
  if (["APPROVED", "ACTIVE", "CAPTURED", "RESOLVED", "PUBLISHED", "SENT", "COLLECTED"].includes(s)) return "success";
  if (["REJECTED", "SUSPENDED", "REFUNDED", "FAILED"].includes(s)) return "error";
  if (["PENDING", "OPEN", "DRAFT", "QUEUED", "IN_PROGRESS", "ACKNOWLEDGED"].includes(s)) return "warning";
  return "neutral";
}

export function StatusBadge({ status, label }: { status: string | null | undefined; label?: string }) {
  const text = label ?? (status ? status.replace(/_/g, " ").toLowerCase() : "pending");
  return <Badge tone={statusTone(status ?? "pending")}>{text}</Badge>;
}

/** Bordered, horizontally scrollable table with a consistent header and empty state. */
export function AdminTable({
  columns,
  empty,
  isEmpty,
  children,
  caption,
}: {
  columns: string[];
  empty: string;
  isEmpty: boolean;
  children: ReactNode;
  caption?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-card border border-charcoal-200 bg-white">
      <table className="w-full text-left text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="bg-charcoal-50 text-xs font-bold uppercase text-charcoal-500">
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col" className="whitespace-nowrap px-4 py-3">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-charcoal-100">
          {isEmpty ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-charcoal-500">
                {empty}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export const td = "px-4 py-3 align-top";

/** A titled panel used for lists that are not tables (incidents, tickets, settings...). */
export function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-card border border-charcoal-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-charcoal-200 px-5 py-4">
        <h2 className="text-base font-extrabold text-charcoal-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyRow({ children }: { children: ReactNode }) {
  return <p className="p-6 text-sm text-charcoal-500">{children}</p>;
}

/** Search box + right-aligned actions, the same on every list. */
export function Toolbar({
  search,
  onSearch,
  placeholder = "Search...",
  children,
}: {
  search?: string;
  onSearch?: (value: string) => void;
  placeholder?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {onSearch ? (
        <label className="relative w-full sm:max-w-md">
          <span className="sr-only">{placeholder}</span>
          <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" aria-hidden />
          <TextInput type="search" value={search ?? ""} onChange={(e) => onSearch(e.target.value)} placeholder={placeholder} className="pl-9" />
        </label>
      ) : (
        <span />
      )}
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

/** Cancel / submit row at the bottom of every admin form. */
export function FormActions({
  onCancel,
  submitLabel = "Save",
  pending,
  disabled = false,
}: {
  onCancel: () => void;
  submitLabel?: string;
  pending: boolean;
  /** Disable submit without showing a spinner (e.g. nothing to submit yet). */
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button type="button" variant="secondary" size="md" onClick={onCancel} disabled={pending}>
        Cancel
      </Button>
      <Button type="submit" variant="primary" size="md" loading={pending} disabled={disabled}>
        {submitLabel}
      </Button>
    </div>
  );
}

export const formatINR = (n: number | null | undefined) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "-"
    : d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
}

/** True when any of the values contains the (lower-cased, trimmed) query. */
export function matches(query: string, ...values: Array<string | number | null | undefined>): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return values.some((v) => String(v ?? "").toLowerCase().includes(q));
}
