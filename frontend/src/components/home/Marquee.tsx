import type { CSSProperties, ReactNode } from "react";

/**
 * Endless horizontal scroller (CSS only). Children are rendered twice so the loop is seamless; the second copy
 * is hidden from assistive tech. Pauses on hover; under reduced motion it becomes a static wrapped list.
 */
export function Marquee({ children, speed = 38, className = "" }: { children: ReactNode; speed?: number; className?: string }) {
  return (
    <div className={`rj-marquee overflow-hidden ${className}`} style={{ "--rj-marquee-speed": `${speed}s` } as CSSProperties}>
      <div className="rj-marquee-track">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
