/**
 * Geometry for the homepage course map. The route is an ILLUSTRATION, not the surveyed course: a smooth curve
 * through hand-placed control points, sampled so any fraction of the route (0..1) maps to an x/y position.
 * Pure functions only, so it renders on the server and is unit-tested (tests/home.test.mts).
 */

export interface Pt {
  x: number;
  y: number;
}

export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 420;

/** Control points (viewBox 1000 x 420). Starts and finishes at the Stupa on the left. */
export const ROUTE_POINTS: Pt[] = [
  { x: 92, y: 322 },
  { x: 176, y: 238 },
  { x: 268, y: 292 },
  { x: 364, y: 188 },
  { x: 470, y: 244 },
  { x: 566, y: 140 },
  { x: 664, y: 204 },
  { x: 766, y: 112 },
  { x: 862, y: 176 },
  { x: 934, y: 96 },
  { x: 958, y: 226 },
  { x: 880, y: 322 },
  { x: 776, y: 286 },
  { x: 684, y: 352 },
  { x: 580, y: 322 },
  { x: 474, y: 372 },
  { x: 366, y: 336 },
  { x: 250, y: 380 },
  { x: 118, y: 344 },
];

export interface Route {
  /** SVG path data. */
  d: string;
  /** Dense samples along the path with cumulative length. */
  samples: { x: number; y: number; len: number }[];
  length: number;
}

/** Catmull-Rom spline through `pts`, converted to cubic Bezier segments, plus dense samples for lookups. */
export function buildRoute(pts: Pt[], samplesPerSegment = 28): Route {
  const segs: [Pt, Pt, Pt, Pt][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    segs.push([p1, c1, c2, p2]);
  }
  let d = `M ${pts[0].x} ${pts[0].y}`;
  const samples: Route["samples"] = [{ x: pts[0].x, y: pts[0].y, len: 0 }];
  let length = 0;
  for (const [p1, c1, c2, p2] of segs) {
    d += ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p2.x} ${p2.y}`;
    for (let s = 1; s <= samplesPerSegment; s++) {
      const t = s / samplesPerSegment;
      const u = 1 - t;
      const x = u * u * u * p1.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p2.x;
      const y = u * u * u * p1.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p2.y;
      const prev = samples[samples.length - 1];
      length += Math.hypot(x - prev.x, y - prev.y);
      samples.push({ x, y, len: length });
    }
  }
  return { d, samples, length };
}

export const ROUTE: Route = buildRoute(ROUTE_POINTS);

/** Position at `fraction` (0..1, clamped) of the route length. */
export function pointAt(route: Route, fraction: number): Pt {
  const f = Math.min(1, Math.max(0, fraction));
  const target = f * route.length;
  const s = route.samples;
  let lo = 0;
  let hi = s.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (s[mid].len < target) lo = mid + 1;
    else hi = mid;
  }
  if (lo === 0) return { x: s[0].x, y: s[0].y };
  const a = s[lo - 1];
  const b = s[lo];
  const span = b.len - a.len || 1;
  const k = (target - a.len) / span;
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
}

/** Share of the full marathon covered by a category (0..1). */
export function routeFraction(distanceKm: number, fullKm: number): number {
  if (!fullKm) return 0;
  return Math.min(1, Math.max(0, distanceKm / fullKm));
}

/** Illustrative relative elevation (0..1) at a fraction of the route. Not survey data. */
export function elevationAt(fraction: number): number {
  const f = Math.min(1, Math.max(0, fraction));
  const v = 0.5 + 0.24 * Math.sin(f * Math.PI * 3.1 + 0.5) + 0.14 * Math.sin(f * Math.PI * 7.3 + 1.2) + 0.06 * Math.sin(f * Math.PI * 13);
  return Math.min(1, Math.max(0, v));
}

/** Named places shown on the map (all already referenced in the site copy). `f` is where they sit on the route. */
export const LANDMARKS: { label: string; sub: string; f: number }[] = [
  { label: "Vishwa Shanti Stupa", sub: "Start & finish", f: 0 },
  { label: "Cyclopean Wall", sub: "2,500-year-old fortification", f: 0.4 },
  { label: "Ratnagiri Hills", sub: "The climb", f: 0.7 },
];
