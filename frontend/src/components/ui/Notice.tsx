import type { ReactNode } from "react";
import { LuCircleCheck, LuCircleX, LuInfo, LuTriangleAlert } from "react-icons/lu";
import { cn } from "./cn";

/** Inline message. Meaning is carried by an icon and text, never by color alone. */
export type NoticeTone = "info" | "success" | "warning" | "error";

const TONES: Record<NoticeTone, { box: string; Icon: typeof LuInfo }> = {
  info: { box: "border-[#93C5FD] bg-[#DBEAFE] text-[#1E3A8A]", Icon: LuInfo },
  success: { box: "border-[#86EFAC] bg-[#DCFCE7] text-[#14532D]", Icon: LuCircleCheck },
  warning: { box: "border-[#FCD34D] bg-[#FEF3C7] text-[#78350F]", Icon: LuTriangleAlert },
  error: { box: "border-[#FCA5A5] bg-[#FEE2E2] text-[#7F1D1D]", Icon: LuCircleX },
};

export function Notice({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: NoticeTone;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const { box, Icon } = TONES[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex gap-3 rounded-card border px-4 py-3 text-sm", box, className)}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn(title && "mt-0.5", "leading-relaxed")}>{children}</div> : null}
      </div>
    </div>
  );
}
