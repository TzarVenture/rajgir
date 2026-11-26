"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/useInView";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Number that counts up from 0 the first time it scrolls into view. Server HTML and no-JS show the final value;
 * with reduced motion it simply stays at the final value.
 */
export function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1600,
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    let raf = 0;
    // Start from zero only when the animation will actually run, so nothing flashes for no-JS or reduced-motion users.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShown(0);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          setShown(value * easeOutCubic(t));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  const text = shown.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}
