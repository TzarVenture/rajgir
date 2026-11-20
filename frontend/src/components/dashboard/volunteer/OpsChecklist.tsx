"use client";

import { useState, useTransition } from "react";
import { setChecklistItem } from "@/app/actions/dashboard";
import { Notice } from "@/components/ui";
import type { ChecklistGroup } from "@/lib/volunteerOps";

/** Station checklist; each tick is saved immediately and rolled back if the save fails. */
export function OpsChecklist({ groups, initial }: { groups: ChecklistGroup[]; initial: Record<string, string> }) {
  const [done, setDone] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(Object.keys(initial).map((k) => [k, true]))
  );
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  const all = groups.flatMap((g) => g.items);
  const completed = all.filter((i) => done[i.id]).length;
  const pct = all.length ? Math.round((completed / all.length) * 100) : 0;

  function toggle(id: string, value: boolean) {
    setError("");
    setDone((d) => ({ ...d, [id]: value }));
    startTransition(async () => {
      const res = await setChecklistItem(id, value);
      if (!res.success) {
        setDone((d) => ({ ...d, [id]: !value }));
        setError(res.error ?? "Could not save that item.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 flex justify-between text-xs font-semibold text-charcoal-600">
          <span>
            {completed} of {all.length} done
          </span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-charcoal-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Checklist progress">
          <div className="h-full rounded-full bg-[#16A34A] transition-[width]" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {groups.map((g) => (
        <fieldset key={g.title}>
          <legend className="mb-2 text-sm font-bold text-charcoal-900">{g.title}</legend>
          <ul className="space-y-1">
            {g.items.map((item) => (
              <li key={item.id}>
                <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-btn px-2 py-2 text-sm text-charcoal-700 hover:bg-surface-soft">
                  <input
                    type="checkbox"
                    checked={Boolean(done[item.id])}
                    onChange={(e) => toggle(item.id, e.target.checked)}
                    className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#16A34A]"
                  />
                  <span className={done[item.id] ? "text-charcoal-500 line-through" : ""}>{item.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      ))}
    </div>
  );
}
