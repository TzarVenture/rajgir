"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LuCoffee, LuLogIn, LuLogOut, LuRadio } from "react-icons/lu";
import { setVolunteerDutyStatus, volunteerCheckIn, volunteerCheckOut } from "@/app/actions/dashboard";
import { Badge, Button, Notice, cn } from "@/components/ui";
import type { ApiAttendance } from "@/lib/api";
import { formatDate, formatDuration, formatTime } from "@/lib/event";
import { currentPosition } from "./geo";

type Duty = "OFF_DUTY" | "ON_DUTY" | "ON_BREAK";

const DUTY_LABEL: Record<Duty, string> = { OFF_DUTY: "Off duty", ON_DUTY: "On duty", ON_BREAK: "On break" };

/** Shift check-in / check-out, live duty status toggle and attendance history. */
export function ShiftControl({
  attendance,
  dutyStatus,
  checkInOpen,
  shiftLabel,
}: {
  attendance: ApiAttendance[];
  dutyStatus: Duty;
  checkInOpen: boolean;
  shiftLabel: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  // Optimistic status while a change is saving; otherwise the server value.
  const [optimistic, setOptimistic] = useState<Duty | null>(null);
  const status = optimistic ?? dutyStatus;
  const [now, setNow] = useState<number | null>(null);

  const open = attendance.find((a) => !a.checkOutAt) ?? null;
  const checkedIn = Boolean(open);

  useEffect(() => {
    if (!open) return;
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [open]);

  const totalSeconds = attendance.reduce((sum, a) => {
    const start = new Date(a.checkInAt).getTime();
    const end = a.checkOutAt ? new Date(a.checkOutAt).getTime() : (now ?? start);
    return sum + Math.max(0, (end - start) / 1000);
  }, 0);

  function run(action: () => Promise<{ success: boolean; error?: string }>, next?: Duty) {
    setError("");
    if (next) setOptimistic(next);
    startTransition(async () => {
      const res = await action();
      if (!res.success) setError(res.error ?? "Something went wrong.");
      else router.refresh();
      setOptimistic(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-charcoal-200 bg-surface-soft p-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "h-3 w-3 rounded-full",
              status === "ON_DUTY" ? "bg-[#16A34A]" : status === "ON_BREAK" ? "bg-brand-saffron" : "bg-charcoal-400"
            )}
            aria-hidden
          />
          <div>
            <p className="font-bold text-charcoal-900" aria-live="polite">
              {DUTY_LABEL[status]}
            </p>
            <p className="text-xs text-charcoal-500">
              {open && now ? `Checked in at ${formatTime(open.checkInAt)} | ${formatDuration((now - new Date(open.checkInAt).getTime()) / 1000)} on shift` : shiftLabel ?? "Shift time to be confirmed by your supervisor"}
            </p>
          </div>
        </div>
        {checkedIn ? (
          <Button
            variant="secondary"
            size="md"
            icon={LuLogOut}
            loading={pending}
            onClick={() => {
              if (window.confirm("Check out and end this shift?")) run(volunteerCheckOut, "OFF_DUTY");
            }}
          >
            Check out
          </Button>
        ) : (
          <Button
            size="md"
            icon={LuLogIn}
            loading={pending}
            disabled={!checkInOpen}
            onClick={() => run(async () => volunteerCheckIn(await currentPosition()), "ON_DUTY")}
          >
            Check in
          </Button>
        )}
      </div>

      {!checkInOpen && !checkedIn ? (
        <Notice tone="info">Check-in opens during race week (expo, setup and race day). Your location is recorded at check-in if you allow it.</Notice>
      ) : null}
      {error ? <Notice tone="error">{error}</Notice> : null}

      {/* Live status toggle */}
      <div>
        <p className="mb-2 text-sm font-semibold text-charcoal-900">Live shift status</p>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Shift status">
          {(
            [
              { value: "ON_DUTY", label: "On duty", icon: LuRadio },
              { value: "ON_BREAK", label: "On break", icon: LuCoffee },
            ] as const
          ).map((opt) => {
            const selected = status === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={!checkedIn || pending}
                onClick={() => !selected && run(() => setVolunteerDutyStatus(opt.value), opt.value)}
                className={cn(
                  "flex min-h-11 items-center justify-center gap-2 rounded-btn border text-sm font-semibold transition-colors",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  selected ? "border-brand-red bg-brand-red-light text-brand-red-dark" : "border-charcoal-300 bg-white text-charcoal-700 hover:bg-charcoal-50"
                )}
              >
                <opt.icon className="h-4 w-4" aria-hidden /> {opt.label}
              </button>
            );
          })}
        </div>
        {!checkedIn ? <p className="mt-1 text-xs text-charcoal-500">Available after you check in.</p> : null}
      </div>

      {/* Attendance */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-charcoal-900">Attendance</p>
          <Badge tone="neutral">Total {formatDuration(totalSeconds)}</Badge>
        </div>
        {attendance.length ? (
          <ul className="divide-y divide-charcoal-200 rounded-card border border-charcoal-200 text-sm">
            {attendance.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                <span>
                  {formatDate(a.checkInAt, { year: undefined, weekday: "short" })}: {formatTime(a.checkInAt)} -{" "}
                  {a.checkOutAt ? formatTime(a.checkOutAt) : "now"}
                </span>
                <span className="text-xs text-charcoal-500">{a.station ?? "No station"}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-charcoal-500">No shifts recorded yet.</p>
        )}
      </div>
    </div>
  );
}
