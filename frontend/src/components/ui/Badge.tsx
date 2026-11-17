import type { ReactNode } from "react";
import { cn } from "./cn";

/** Small status/label chip, 6px radius. Text colors are dark enough for AA contrast on their tint. */
export type BadgeTone = "neutral" | "brand" | "heritage" | "success" | "warning" | "info" | "error";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-charcoal-100 text-charcoal-700",
  brand: "bg-brand-red-light text-brand-red-dark",
  heritage: "border border-[#F3DFA8] bg-surface-warm text-[#7A4E08]",
  success: "bg-[#DCFCE7] text-[#15803D]",
  warning: "bg-[#FEF3C7] text-[#92400E]",
  info: "bg-[#DBEAFE] text-[#1D4ED8]",
  error: "bg-[#FEE2E2] text-[#B91C1C]",
};

export function Badge({ tone = "neutral", children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-[6px] px-2 py-1 text-[11px] font-semibold leading-none", TONES[tone], className)}>
      {children}
    </span>
  );
}
