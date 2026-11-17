import type { ReactNode } from "react";
import { cn } from "./cn";

/** Page heading block: small label, Barlow Condensed title (32px mobile / 44px desktop), supporting text. */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  align = "left",
  children,
  className,
}: {
  eyebrow?: ReactNode;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-8", align === "center" && "text-center", className)}>
      {eyebrow ? <div className={cn("mb-3 flex", align === "center" && "justify-center")}>{eyebrow}</div> : null}
      <h1 className="font-barlow text-[32px] font-bold uppercase leading-[1.05] tracking-tight text-charcoal-900 sm:text-[44px]">{title}</h1>
      {subtitle ? (
        <p className={cn("mt-3 max-w-2xl text-[15px] leading-relaxed text-charcoal-600 sm:text-base", align === "center" && "mx-auto")}>{subtitle}</p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </header>
  );
}
