import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { cn } from "./cn";

/** Standard card: white, 1px #E5E7EB border, 12px radius (designn.md sections 5 and 7). */
export function Card({
  children,
  className,
  padded = true,
  id,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  id?: string;
}) {
  return (
    <div id={id} className={cn("rounded-card border border-charcoal-200 bg-white scroll-mt-24", padded && "p-5 sm:p-6", className)}>{children}</div>
  );
}

/** Larger promotional card: 16px radius with a soft shadow. */
export function FeatureCard({ children, className, padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-feature border border-charcoal-200 bg-white shadow-[0_2px_8px_rgba(17,24,39,0.05)]",
        padded && "p-6 sm:p-8",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Titled card used for each group of form fields. */
export function FormSection({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon?: IconType;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <div className="mb-5 flex items-start gap-3 border-b border-charcoal-200 pb-4">
        {Icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-red-light text-brand-red">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        ) : null}
        <div>
          <h2 className="text-base font-bold text-charcoal-900">{title}</h2>
          {description ? <p className="mt-0.5 text-sm text-charcoal-500">{description}</p> : null}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}
