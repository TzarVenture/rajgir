"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useInView } from "@/lib/useInView";

/**
 * Fades and slides its children in when scrolled into view (CSS in site-theme.css, `.rj-reveal`).
 * `index` staggers siblings (90ms steps). Under reduced motion the CSS shows content immediately.
 */
export function Reveal({
  as,
  index = 0,
  className = "",
  children,
}: {
  as?: ElementType;
  index?: number;
  className?: string;
  children: ReactNode;
}) {
  const Tag = (as ?? "div") as ElementType;
  const { ref, visible } = useInView<HTMLElement>();
  return (
    <Tag ref={ref} data-visible={visible} style={{ "--i": index } as CSSProperties} className={`rj-reveal ${className}`}>
      {children}
    </Tag>
  );
}
