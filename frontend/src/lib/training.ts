import { EVENT, IST_OFFSET, categoryOps } from "@/lib/event";

/**
 * General build-up plan per race category: base, build, peak and taper phases,
 * with a lighter "cut-back" week every fourth week. Guidance only, not a personal coaching plan.
 */
export type TrainingPhase = "Base" | "Build" | "Peak" | "Taper" | "Race week";

export interface TrainingWeek {
  /** 1 = first week of the plan; last = race week. */
  week: number;
  weekStart: string;
  phase: TrainingPhase;
  weeklyKm: number;
  longRunKm: number;
  focus: string;
}

export interface TrainingStatus {
  weeks: TrainingWeek[];
  totalWeeks: number;
  /** Plan week we are in today; 0 = plan not started; totalWeeks + 1 = race done. */
  currentWeek: number;
  planStart: string;
  daysToRace: number;
  weeksUntilStart: number;
}

const DAY = 24 * 60 * 60 * 1000;

const FOCUS: Record<TrainingPhase, string> = {
  Base: "Easy conversational runs; build the habit and aerobic base.",
  Build: "Add one tempo or interval session a week; extend the long run gradually.",
  Peak: "Longest runs of the plan; practise race-day nutrition and kit.",
  Taper: "Cut volume, keep a little speed; prioritise sleep and recovery.",
  "Race week": "Short easy runs only; collect your kit at the expo and rest.",
};

export function trainingPlan(distance: string, now = new Date()): TrainingStatus {
  const ops = categoryOps(distance);
  const n = ops.planWeeks;
  const raceDay = new Date(`${EVENT.raceDate}T00:00:00${IST_OFFSET}`);
  const planStart = new Date(raceDay.getTime() - (n * 7 - 1) * DAY);

  const weeks: TrainingWeek[] = [];
  const buildWeeks = Math.max(1, n - 3); // weeks 1..n-3 ramp up; then peak, taper, race week
  for (let w = 1; w <= n; w++) {
    let phase: TrainingPhase;
    let factor: number;
    if (w === n) {
      phase = "Race week";
      factor = 0.4;
    } else if (w === n - 1) {
      phase = "Taper";
      factor = 0.6;
    } else if (w === n - 2) {
      phase = "Peak";
      factor = 1;
    } else {
      const progress = buildWeeks <= 1 ? 1 : (w - 1) / (buildWeeks - 1);
      phase = progress < 0.4 ? "Base" : "Build";
      factor = 0.5 + 0.45 * progress;
      if (w % 4 === 0) factor *= 0.8; // cut-back week
    }
    const weekStart = new Date(planStart.getTime() + (w - 1) * 7 * DAY);
    weeks.push({
      week: w,
      weekStart: weekStart.toISOString(),
      phase,
      weeklyKm: Math.round(ops.peakWeeklyKm * factor),
      longRunKm: w === n ? ops.distanceKm : Math.max(2, Math.round(ops.peakLongRunKm * factor)),
      focus: FOCUS[phase],
    });
  }

  const elapsed = now.getTime() - planStart.getTime();
  const currentWeek = elapsed < 0 ? 0 : Math.min(n + 1, Math.floor(elapsed / (7 * DAY)) + 1);
  const daysToRace = Math.ceil((raceDay.getTime() - now.getTime()) / DAY);

  const weeksUntilStart = Math.max(0, Math.ceil(-elapsed / (7 * DAY)));

  return { weeks, totalWeeks: n, currentWeek, planStart: planStart.toISOString(), daysToRace, weeksUntilStart };
}
