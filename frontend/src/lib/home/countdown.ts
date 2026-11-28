import { CATEGORY_OPS, EVENT, IST_OFFSET } from "@/lib/event";

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once the marathon gun time has passed. */
  done: boolean;
}

/** Gun time of the flagship race on race day, in IST. */
export function raceStart(): number {
  const first = CATEGORY_OPS[0]?.startTime ?? "05:00";
  return new Date(`${EVENT.raceDate}T${first}:00${IST_OFFSET}`).getTime();
}

/** Time remaining until `target` (ms since epoch) as of `now`. Never negative. */
export function timeLeft(target: number, now: number): TimeLeft {
  const diff = Math.max(0, target - now);
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: diff === 0,
  };
}
