"use client";

import { useEffect, useState } from "react";
import { raceStart, timeLeft } from "@/lib/home/countdown";
import type { TimeLeft } from "@/lib/home/countdown";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Live countdown to the flagship start. Renders placeholders on the server and starts ticking after mount, so the
 * server and browser HTML always match. `tone="glass"` is for dark photo backgrounds.
 */
export function Countdown({ tone = "glass", className = "" }: { tone?: "glass" | "light"; className?: string }) {
  const [left, setLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const target = raceStart();
    const update = () => setLeft(timeLeft(target, Date.now()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const cells: { label: string; value: string }[] = [
    { label: "Days", value: left ? String(left.days) : "--" },
    { label: "Hours", value: left ? pad(left.hours) : "--" },
    { label: "Mins", value: left ? pad(left.minutes) : "--" },
    { label: "Secs", value: left ? pad(left.seconds) : "--" },
  ];
  const box =
    tone === "glass"
      ? "border-white/25 bg-white/12 text-white backdrop-blur-md"
      : "border-[#E5E7EB] bg-white text-[#111827] shadow-sm";
  const label = tone === "glass" ? "text-white/75" : "text-[#6B7280]";

  if (left?.done) {
    return <p className={`font-barlow text-2xl font-bold uppercase text-[#FFC928] ${className}`}>Race day is here!</p>;
  }

  return (
    <div className={`flex items-stretch gap-2 ${className}`} role="timer" aria-label="Time until race day">
      {cells.map((c, i) => (
        <div key={c.label} className="flex items-center gap-2">
          <div className={`flex min-w-[58px] flex-col items-center rounded-xl border px-2.5 py-2 sm:min-w-[66px] ${box}`}>
            <span className="font-barlow text-3xl font-bold leading-none sm:text-4xl" style={{ fontVariantNumeric: "tabular-nums" }}>
              {c.value}
            </span>
            <span className={`mt-1 text-[10px] font-bold uppercase tracking-widest ${label}`}>{c.label}</span>
          </div>
          {i < cells.length - 1 ? <span className={`hidden text-xl font-bold sm:block ${label}`} aria-hidden>:</span> : null}
        </div>
      ))}
    </div>
  );
}
