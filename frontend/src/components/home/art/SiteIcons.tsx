import type { CSSProperties, ReactNode, SVGProps } from "react";

/**
 * Rajgir Marathon icon set: one consistent hand-drawn style (48px grid, 2.5px rounded line, gold accent) built
 * around the event's own landmarks (Vishwa Shanti Stupa, five hills, finisher medal, route, bib tee).
 *
 * Motion (CSS in (site)/site-theme.css, classes `rj-d`, `rj-m-*`):
 *  - lines draw themselves once when the icon scrolls in, and redraw when a `.group` ancestor is hovered
 *  - each icon has one small hover motion (runner dashes, medal swings, steam rises, hand sweeps...)
 * Nothing loops or blinks; reduced-motion users get the finished icon.
 */

export type SiteIconName =
  | "runner"
  | "stupa"
  | "hills"
  | "medal"
  | "highfive"
  | "trophy"
  | "pin"
  | "tee"
  | "route"
  | "stopwatch"
  | "heartpulse"
  | "drop"
  | "shield"
  | "bowl"
  | "team"
  | "building"
  | "cap"
  | "rings"
  | "coin"
  | "flag"
  | "calendar"
  | "person"
  | "arrow"
  | "check"
  | "book"
  | "shoe"
  | "plane";

type PathProps = Omit<SVGProps<SVGPathElement>, "ref"> & { a?: boolean };

/** Stroked line that can draw itself. `a` = accent colour. */
function D({ a, className = "", ...rest }: PathProps) {
  return <path pathLength={1} className={`rj-d ${a ? "rj-acc" : ""} ${className}`} {...rest} />;
}
/** Filled accent shape (no stroke, so it does not draw). */
function F({ className = "", ...rest }: Omit<SVGProps<SVGPathElement>, "ref">) {
  return <path className={`rj-accf ${className}`} {...rest} />;
}
const pivot = (x: number, y: number): CSSProperties => ({ transformOrigin: `${x}px ${y}px`, transformBox: "view-box" });

const ICONS: Record<SiteIconName, () => ReactNode> = {
  /* Runner leaning forward, with speed lines that dash on hover. */
  runner: () => (
    <>
      <circle className="rj-d" pathLength={1} cx="30" cy="8.5" r="4" />
      <D d="M27 15 L21.5 27" />
      <D d="M26.5 17.5 L34 21 L38 15.5" />
      <D d="M25 19 L17 20 L12 25.5" />
      <D d="M21.5 27 L29.5 31.5 L28 41" />
      <D d="M21.5 27 L14 33.5 L7.5 31" />
      <g className="rj-m-speed">
        <D a d="M3 15 H10" />
        <D a d="M5 21 H11" />
      </g>
    </>
  ),
  /* Vishwa Shanti Stupa: dome, spire and stepped base. */
  stupa: () => (
    <>
      <D d="M9 33 C9 19 39 19 39 33" />
      <D d="M24 17 V10" />
      <D d="M21 17 H27 V20" />
      <D d="M6 41 H42" />
      <D d="M9 37 H39" />
      <D d="M21 37 V32.5 C21 29.5 27 29.5 27 32.5 V37" />
      <D a d="M14 27 H34" />
      <circle className="rj-accf rj-m-bob" cx="24" cy="7.5" r="2" />
    </>
  ),
  /* Five sacred hills. */
  hills: () => (
    <>
      <D d="M3 39 L11 23 L16 31 L24 14 L32 31 L37 23 L45 39 Z" />
      <D a d="M24 14 L20.5 21 M24 14 L27.5 21" />
      <D d="M11 23 L9 27 M37 23 L39 27" />
      <D d="M3 39 H45" />
      <g className="rj-m-rise" style={pivot(24, 39)}>
        <D a d="M16 39 C18 36 22 36 24 39" />
      </g>
    </>
  ),
  /* Finisher medal with the stupa on its face; swings on hover. */
  medal: () => (
    <g className="rj-m-swing" style={pivot(24, 4)}>
      <D d="M16 4 L22.5 19 M32 4 L25.5 19" />
      <D d="M16 4 H32" />
      <circle className="rj-d" pathLength={1} cx="24" cy="31" r="11.5" />
      <D a d="M17.5 36 C17.5 28 30.5 28 30.5 36" />
      <D d="M24 28 V25.5" />
      <D d="M16.5 37 H31.5" />
    </g>
  ),
  /* A volunteer cheering with both arms up. */
  highfive: () => (
    <>
      <circle className="rj-d" pathLength={1} cx="24" cy="15" r="4.5" />
      <D d="M24 19.5 V35" />
      <g className="rj-m-armL" style={pivot(24, 25)}>
        <D d="M24 25 L12.5 12.5" />
      </g>
      <g className="rj-m-armR" style={pivot(24, 25)}>
        <D d="M24 25 L35.5 12.5" />
      </g>
      <D d="M24 35 L17.5 44 M24 35 L30.5 44" />
      <g className="rj-m-spark" style={pivot(24, 10)}>
        <D a d="M7.5 7.5 L10.5 10.5 M5.5 13.5 H9.5" />
        <D a d="M40.5 7.5 L37.5 10.5 M42.5 13.5 H38.5" />
      </g>
    </>
  ),
  /* Trophy; a gold shine slides across the cup on hover. */
  trophy: () => (
    <>
      <D d="M15 7 H33 V20 C33 27 28.5 30.5 24 30.5 C19.5 30.5 15 27 15 20 Z" />
      <D d="M15 11.5 H9.5 C9.5 18 12 21 16.5 22" />
      <D d="M33 11.5 H38.5 C38.5 18 36 21 31.5 22" />
      <D d="M24 30.5 V37" />
      <D d="M16.5 41 H31.5" />
      <D d="M19 37 H29" />
      <g className="rj-m-shine">
        <D a d="M19.5 11 V18" />
        <D a d="M22.5 11 V16" />
      </g>
    </>
  ),
  /* Map pin with the stupa inside. */
  pin: () => (
    <g className="rj-m-bob">
      <D d="M24 44 C24 44 10 30.5 10 20 C10 12 16 6 24 6 C32 6 38 12 38 20 C38 30.5 24 44 24 44 Z" />
      <D a d="M17.5 24 C17.5 16 30.5 16 30.5 24" />
      <D d="M24 17.5 V14" />
      <D d="M16 24.5 H32" />
    </g>
  ),
  /* T-shirt with a race bib. */
  tee: () => (
    <g className="rj-m-sway" style={pivot(24, 6)}>
      <D d="M17 6 L7.5 11 L11.5 19.5 L17 17 V41 H31 V17 L36.5 19.5 L40.5 11 L31 6 C30 9.5 27 10.5 24 10.5 C21 10.5 18 9.5 17 6 Z" />
      <D a d="M20.5 22 H27.5 V31 H20.5 Z" />
      <D a d="M22.5 25 H25.5 M22.5 28 H25.5" />
    </g>
  ),
  /* Winding route ending at a finish flag. */
  route: () => (
    <>
      <D className="rj-m-flow" d="M6 41 C14 41 14 29 24 29 C34 29 34 17 42 17" />
      <circle className="rj-accf" cx="6" cy="41" r="2.8" />
      <D d="M42 17 V5" />
      <D a d="M42 5 H34 L37 8.5 L34 12 H42" />
    </>
  ),
  /* Stopwatch (RFID timing, cut-off); the hand sweeps on hover. */
  stopwatch: () => (
    <>
      <circle className="rj-d" pathLength={1} cx="24" cy="27" r="14.5" />
      <D d="M20.5 6 H27.5" />
      <D d="M24 6 V12.5" />
      <D d="M37 13.5 L40 10.5" />
      <D a d="M24 16.5 V18.5 M12.5 27 H14.5 M33.5 27 H35.5" />
      <g className="rj-m-hand" style={pivot(24, 27)}>
        <D a d="M24 27 L30 20.5" />
      </g>
    </>
  ),
  /* Heart with a heartbeat line (medical). */
  heartpulse: () => (
    <>
      <g className="rj-m-beat" style={pivot(24, 24)}>
        <D d="M24 41 C10 31 6 24.5 6 18 C6 12 10 8 15 8 C19 8 22 10 24 13 C26 10 29 8 33 8 C38 8 42 12 42 18 C42 24.5 38 31 24 41 Z" />
      </g>
      <D a d="M10 24.5 H18 L21 18 L26.5 31 L29 24.5 H38" />
    </>
  ),
  /* Hydration drop with a water line. */
  drop: () => (
    <>
      <D d="M24 5 C24 5 11 20 11 29 C11 36 17 42 24 42 C31 42 37 36 37 29 C37 20 24 5 24 5 Z" />
      <g className="rj-m-wave">
        <D a d="M15.5 30 C18.5 26.5 21 33.5 24 30 C27 26.5 29.5 33.5 32.5 30" />
      </g>
      <D d="M18 20 C16.5 22.5 16 24.5 16 26.5" />
    </>
  ),
  /* Shield with check (security and baggage lounges). */
  shield: () => (
    <>
      <D d="M24 5 L9 11 V23 C9 33 16 40 24 43 C32 40 39 33 39 23 V11 Z" />
      <D a d="M16.5 24 L22 29.5 L32 18.5" />
    </>
  ),
  /* Recovery breakfast bowl with rising steam. */
  bowl: () => (
    <>
      <D d="M7 24 H41 C41 33 34 39 24 39 C14 39 7 33 7 24 Z" />
      <D d="M17.5 43 H30.5" />
      <g className="rj-m-steam">
        <D a d="M17 18.5 C14.5 15.5 19.5 13 17 9.5" />
        <D a d="M24 18.5 C21.5 15.5 26.5 13 24 9.5" />
        <D a d="M31 18.5 C28.5 15.5 33.5 13 31 9.5" />
      </g>
    </>
  ),
  /* Team of three. */
  team: () => (
    <>
      <circle className="rj-d" pathLength={1} cx="24" cy="14" r="5" />
      <D d="M14 40 C14 29.5 34 29.5 34 40" />
      <g className="rj-m-bob">
        <circle className="rj-d rj-acc" pathLength={1} cx="9.5" cy="20" r="3.8" />
        <D a d="M2.5 38 C2.5 31.5 9 30 13.5 32" />
        <circle className="rj-d rj-acc" pathLength={1} cx="38.5" cy="20" r="3.8" />
        <D a d="M45.5 38 C45.5 31.5 39 30 34.5 32" />
      </g>
    </>
  ),
  /* Office tower (corporate). */
  building: () => (
    <>
      <D d="M11 42 V7 H30 V42" />
      <D d="M30 19 H38 V42" />
      <D d="M7 42 H41" />
      <D d="M18 42 V36 H23 V42" />
      <g className="rj-m-windows">
        <D a d="M16 13 H18 M22.5 13 H24.5 M16 20 H18 M22.5 20 H24.5 M16 27 H18 M22.5 27 H24.5" />
      </g>
    </>
  ),
  /* Graduation cap (schools). */
  cap: () => (
    <>
      <D d="M24 8 L3.5 18 L24 28 L44.5 18 Z" />
      <D d="M12 23 V32 C12 36.5 36 36.5 36 32 V23" />
      <g className="rj-m-tassel" style={pivot(41, 20)}>
        <D a d="M41 20 V32" />
        <circle className="rj-accf" cx="41" cy="34" r="2" />
      </g>
    </>
  ),
  /* Two linked rings (partners). */
  rings: () => (
    <>
      <g className="rj-m-ringL">
        <circle className="rj-d" pathLength={1} cx="18" cy="24" r="11.5" />
      </g>
      <g className="rj-m-ringR">
        <circle className="rj-d rj-acc" pathLength={1} cx="30" cy="24" r="11.5" />
      </g>
    </>
  ),
  /* Rupee coin (prize purse). */
  coin: () => (
    <g className="rj-m-flip" style={pivot(24, 24)}>
      <circle className="rj-d" pathLength={1} cx="24" cy="24" r="16.5" />
      <circle className="rj-d" pathLength={1} cx="24" cy="24" r="11.5" strokeDasharray="1" opacity="0.5" />
      <D a d="M18.5 16.5 H30 M18.5 21.5 H30 M21.5 16.5 C28.5 16.5 28.5 25.5 21 25.5 H19.5 L27.5 33" />
    </g>
  ),
  /* Chequered start/finish flag. */
  flag: () => (
    <>
      <D d="M11 6 V43" />
      <g className="rj-m-wave">
        <D d="M11 8 H35 V26 H11 Z" />
        <path className="rj-accf" d="M17 8 H23 V14 H17 Z M29 8 H35 V14 H29 Z M11 14 H17 V20 H11 Z M23 14 H29 V20 H23 Z M17 20 H23 V26 H17 Z M29 20 H35 V26 H29 Z" />
      </g>
    </>
  ),
  /* Calendar (race date). */
  calendar: () => (
    <>
      <D d="M7 11 H41 V42 H7 Z" />
      <D d="M7 20 H41" />
      <D d="M16 6 V14 M32 6 V14" />
      <rect className="rj-accf rj-m-pop" x="28" y="26" width="6" height="6" rx="1" />
    </>
  ),
  /* Person (minimum age). */
  person: () => (
    <>
      <circle className="rj-d" pathLength={1} cx="24" cy="15" r="6.5" />
      <D d="M10.5 41 C10.5 28.5 37.5 28.5 37.5 41" />
    </>
  ),
  /* Arrow (slides on hover). */
  arrow: () => (
    <g className="rj-m-slide">
      <D d="M7 24 H39" />
      <D d="M28 12.5 L39.5 24 L28 35.5" />
    </g>
  ),
  check: () => <D d="M9 25.5 L19.5 36 L39 13" />,
  /* Open book (stories). */
  book: () => (
    <>
      <D d="M24 12 C19 8 11 8 5 11 V38 C11 35 19 35 24 39 C29 35 37 35 43 38 V11 C37 8 29 8 24 12 Z" />
      <D d="M24 12 V39" />
      <g className="rj-m-bob">
        <D a d="M10.5 18 H18.5 M10.5 24 H18.5 M29.5 18 H37.5 M29.5 24 H37.5" />
      </g>
    </>
  ),
  /* Running shoe (training). */
  shoe: () => (
    <>
      <D d="M5 34 V21 C5 21 10 24 14.5 24 L19.5 16.5 L25 20 C27 23 33 24.5 38.5 26.5 C42.5 28 43.5 31 43.5 34 V37 H5 Z" />
      <D a d="M5 33 H43.5" />
      <g className="rj-m-laces">
        <D a d="M20.5 22 L23.5 24.5 M24 19.5 L27 22" />
      </g>
    </>
  ),
  /* Paper plane (newsletter). */
  plane: () => (
    <g className="rj-m-fly">
      <D d="M44 5 L4 21 L19 27 L25 42 Z" />
      <D d="M19 27 L44 5" />
      <D a d="M19 27 V35" />
    </g>
  ),
};

/** Renders a site icon. Size and colour come from the className (`h-6 w-6 text-[#E31B23]`); `accent` overrides the gold accent. */
export function SiteIcon({ name, className = "h-6 w-6", accent, title }: { name: SiteIconName; className?: string; accent?: string; title?: string }) {
  const style = accent ? ({ "--rj-acc": accent } as CSSProperties) : undefined;
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`rj-ico rj-ico-${name} ${className}`}
      style={style}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {ICONS[name]()}
    </svg>
  );
}
