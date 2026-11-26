"use client";

import { useEffect, useId, useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { LuX } from "react-icons/lu";
import { cn } from "./cn";

/** Dialog with 16px radius. Closes on Escape or backdrop click, locks page scroll, returns focus on close. */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** Panel width from the sm breakpoint up. */
  size?: "md" | "lg" | "xl";
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // Keep the latest onClose in a ref so the effect below runs only when `open` changes.
  // Callers usually pass an inline arrow, which is a new function on every render (every keystroke);
  // if it were an effect dependency, the cleanup/setup would bounce focus out of the input being typed in.
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-charcoal-900/50 p-0 sm:items-center sm:p-4" onMouseDown={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
        className={cn(
          "flex max-h-[90vh] w-full flex-col rounded-t-feature bg-white shadow-[0_16px_40px_rgba(17,24,39,0.18)] outline-none sm:rounded-feature",
          size === "md" && "sm:max-w-lg",
          size === "lg" && "sm:max-w-2xl",
          size === "xl" && "sm:max-w-4xl",
          className
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-charcoal-200 px-5 py-4">
          <h2 id={titleId} className="text-lg font-bold text-charcoal-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-btn text-charcoal-500 hover:bg-charcoal-100 hover:text-charcoal-900"
          >
            <LuX className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-charcoal-200 px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
