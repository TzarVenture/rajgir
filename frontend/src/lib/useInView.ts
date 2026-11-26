"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

/** True when the user asked the OS/browser for less motion. Safe on the server (returns false). */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Tells you when an element is on screen. `once` (default) stays true after the first time, which is what
 * reveal and count-up animations want; pass `once: false` for things that should pause when off screen.
 */
export function useInView<T extends Element>(options: { threshold?: number; rootMargin?: string; once?: boolean } = {}): { ref: RefObject<T | null>; visible: boolean } {
  const { threshold = 0.1, rootMargin = "0px 0px -6% 0px", once = true } = options;
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, visible };
}
