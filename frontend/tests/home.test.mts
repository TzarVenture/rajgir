import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { LANDMARKS, MAP_HEIGHT, MAP_WIDTH, ROUTE, ROUTE_POINTS, buildRoute, elevationAt, pointAt, routeFraction } from "@/lib/home/course";
import { raceStart, timeLeft } from "@/lib/home/countdown";
import { CATEGORY_OPS } from "@/lib/event";

describe("course map geometry", () => {
  it("starts at the first control point and ends at the last", () => {
    const a = pointAt(ROUTE, 0);
    const b = pointAt(ROUTE, 1);
    assert.deepEqual([Math.round(a.x), Math.round(a.y)], [ROUTE_POINTS[0].x, ROUTE_POINTS[0].y]);
    assert.deepEqual([Math.round(b.x), Math.round(b.y)], [ROUTE_POINTS.at(-1)!.x, ROUTE_POINTS.at(-1)!.y]);
  });

  it("finishes close to where it starts (heritage loop at the Stupa)", () => {
    const a = pointAt(ROUTE, 0);
    const b = pointAt(ROUTE, 1);
    assert.ok(Math.hypot(a.x - b.x, a.y - b.y) < 60);
  });

  it("clamps fractions outside 0..1", () => {
    assert.deepEqual(pointAt(ROUTE, -5), pointAt(ROUTE, 0));
    assert.deepEqual(pointAt(ROUTE, 9), pointAt(ROUTE, 1));
  });

  it("moves forward along the route and stays inside the map", () => {
    let travelled = 0;
    let prev = pointAt(ROUTE, 0);
    for (let i = 1; i <= 200; i++) {
      const p = pointAt(ROUTE, i / 200);
      travelled += Math.hypot(p.x - prev.x, p.y - prev.y);
      assert.ok(p.x >= 0 && p.x <= MAP_WIDTH && p.y >= 0 && p.y <= MAP_HEIGHT, `point ${i} left the map: ${p.x},${p.y}`);
      prev = p;
    }
    // Sampled length approximates the real length (within a few percent).
    assert.ok(Math.abs(travelled - ROUTE.length) / ROUTE.length < 0.03);
  });

  it("builds valid SVG path data and cumulative lengths that only grow", () => {
    const r = buildRoute([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 100 }]);
    assert.match(r.d, /^M 0 0( C [-\d., ]+)+$/);
    for (let i = 1; i < r.samples.length; i++) assert.ok(r.samples[i].len >= r.samples[i - 1].len);
    assert.equal(r.samples.at(-1)!.len, r.length);
  });

  it("maps each category to the share of the marathon it covers", () => {
    const full = CATEGORY_OPS[0].distanceKm;
    assert.equal(routeFraction(full, full), 1);
    assert.equal(routeFraction(0, full), 0);
    assert.ok(Math.abs(routeFraction(CATEGORY_OPS[1].distanceKm, full) - 0.5) < 0.01);
    assert.equal(routeFraction(99, full), 1);
    assert.equal(routeFraction(5, 0), 0);
    for (const c of CATEGORY_OPS) {
      const f = routeFraction(c.distanceKm, full);
      assert.ok(f > 0 && f <= 1);
      for (const cp of c.checkpoints) assert.ok(cp.km <= c.distanceKm + 0.01, `${c.distance}: checkpoint ${cp.label} is beyond the finish`);
    }
  });

  it("keeps the illustrative elevation within 0..1 and landmarks in order on the route", () => {
    for (let i = 0; i <= 100; i++) {
      const e = elevationAt(i / 100);
      assert.ok(e >= 0 && e <= 1);
    }
    for (let i = 1; i < LANDMARKS.length; i++) assert.ok(LANDMARKS[i].f > LANDMARKS[i - 1].f);
    assert.equal(LANDMARKS[0].f, 0);
  });
});

describe("race countdown", () => {
  it("counts down to the flagship gun time", () => {
    const start = raceStart();
    assert.ok(Number.isFinite(start));
    const t = timeLeft(start, start - (2 * 86_400_000 + 3 * 3_600_000 + 4 * 60_000 + 5_000));
    assert.deepEqual({ ...t }, { days: 2, hours: 3, minutes: 4, seconds: 5, done: false });
  });

  it("never goes negative and reports done at and after the start", () => {
    const start = raceStart();
    assert.deepEqual({ ...timeLeft(start, start) }, { days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
    assert.equal(timeLeft(start, start + 9_999_999).done, true);
    assert.equal(timeLeft(start, start + 9_999_999).days, 0);
  });

  it("starts at the first wave time on race day in IST", () => {
    const d = new Date(raceStart());
    // 05:00 IST is 23:30 UTC the previous day.
    assert.equal(d.toISOString(), "2027-11-20T23:30:00.000Z");
  });
});
