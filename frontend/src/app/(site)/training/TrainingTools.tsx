"use client";

import { useMemo, useState } from "react";
import { LuCalendarDays, LuGauge, LuHeartPulse } from "react-icons/lu";
import { Badge, Card, Field, Select, TextInput, cn } from "@/components/ui";
import { CATEGORY_OPS, formatDate, formatDuration, formatPace } from "@/lib/event";
import { trainingPlan } from "@/lib/training";

const TABS = [
  { id: "plan", label: "Training plan", icon: LuCalendarDays },
  { id: "pace", label: "Pace calculator", icon: LuGauge },
  { id: "bmi", label: "BMI calculator", icon: LuHeartPulse },
] as const;
type TabId = (typeof TABS)[number]["id"];

function num(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function bmiBand(bmi: number): { label: string; tone: "info" | "success" | "warning" | "error" } {
  if (bmi < 18.5) return { label: "Underweight", tone: "info" };
  if (bmi < 25) return { label: "Healthy range", tone: "success" };
  if (bmi < 30) return { label: "Overweight", tone: "warning" };
  return { label: "Obese range", tone: "error" };
}

function BmiCalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const h = num(height) / 100;
  const w = num(weight);
  const bmi = h > 0 && w > 0 ? w / (h * h) : null;
  const band = bmi ? bmiBand(bmi) : null;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-4">
        <Field label="Height (cm)" htmlFor="bmi-height">
          <TextInput id="bmi-height" inputMode="decimal" placeholder="e.g. 175" value={height} onChange={(e) => setHeight(e.target.value)} />
        </Field>
        <Field label="Weight (kg)" htmlFor="bmi-weight">
          <TextInput id="bmi-weight" inputMode="decimal" placeholder="e.g. 70" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </Field>
      </div>
      <div className="flex flex-col justify-center rounded-card bg-surface-soft p-6 text-center" aria-live="polite">
        {bmi && band ? (
          <>
            <p className="text-sm font-semibold text-charcoal-500">Your BMI</p>
            <p className="font-barlow text-6xl font-bold text-charcoal-900">{bmi.toFixed(1)}</p>
            <div className="mt-2 flex justify-center">
              <Badge tone={band.tone}>{band.label}</Badge>
            </div>
            <p className="mt-4 text-xs text-charcoal-500">BMI is a rough guide only. Consult a doctor before starting a new training programme.</p>
          </>
        ) : (
          <p className="text-sm text-charcoal-500">Enter your height and weight to see your BMI.</p>
        )}
      </div>
    </div>
  );
}

function PaceCalculator() {
  const [distance, setDistance] = useState("21.1 KM");
  const [mode, setMode] = useState<"time" | "pace">("time");
  const [h, setH] = useState("2");
  const [m, setM] = useState("0");
  const [s, setS] = useState("0");
  const [pm, setPm] = useState("5");
  const [ps, setPs] = useState("30");

  const km = CATEGORY_OPS.find((c) => c.distance === distance)!.distanceKm;

  const { totalSeconds, paceSeconds } = useMemo(() => {
    if (mode === "time") {
      const total = num(h) * 3600 + num(m) * 60 + num(s);
      return { totalSeconds: total, paceSeconds: total > 0 ? total / km : 0 };
    }
    const pace = num(pm) * 60 + num(ps);
    return { totalSeconds: pace * km, paceSeconds: pace };
  }, [mode, h, m, s, pm, ps, km]);

  const splits = useMemo(() => {
    if (paceSeconds <= 0) return [];
    const rows: { label: string; elapsed: number }[] = [];
    for (let k = 5; k < km; k += 5) rows.push({ label: `${k} km`, elapsed: paceSeconds * k });
    rows.push({ label: "Finish", elapsed: paceSeconds * km });
    return rows;
  }, [paceSeconds, km]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Field label="Race category" htmlFor="pace-distance">
          <Select id="pace-distance" value={distance} onChange={(e) => setDistance(e.target.value)}>
            {CATEGORY_OPS.map((c) => (
              <option key={c.distance} value={c.distance}>{c.distance}</option>
            ))}
          </Select>
        </Field>
        <div className="flex gap-2" role="tablist" aria-label="Calculate from">
          {(["time", "pace"] as const).map((x) => (
            <button
              key={x}
              type="button"
              role="tab"
              aria-selected={mode === x}
              onClick={() => setMode(x)}
              className={cn(
                "h-10 flex-1 rounded-btn border text-sm font-semibold",
                mode === x ? "border-brand-red bg-brand-red-light text-brand-red-dark" : "border-charcoal-300 bg-white text-charcoal-700"
              )}
            >
              {x === "time" ? "I know my target time" : "I know my pace"}
            </button>
          ))}
        </div>
        {mode === "time" ? (
          <div className="grid grid-cols-3 gap-3">
            <Field label="Hours" htmlFor="pace-h"><TextInput id="pace-h" inputMode="numeric" value={h} onChange={(e) => setH(e.target.value)} /></Field>
            <Field label="Min" htmlFor="pace-m"><TextInput id="pace-m" inputMode="numeric" value={m} onChange={(e) => setM(e.target.value)} /></Field>
            <Field label="Sec" htmlFor="pace-s"><TextInput id="pace-s" inputMode="numeric" value={s} onChange={(e) => setS(e.target.value)} /></Field>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pace min / km" htmlFor="pace-pm"><TextInput id="pace-pm" inputMode="numeric" value={pm} onChange={(e) => setPm(e.target.value)} /></Field>
            <Field label="Seconds" htmlFor="pace-ps"><TextInput id="pace-ps" inputMode="numeric" value={ps} onChange={(e) => setPs(e.target.value)} /></Field>
          </div>
        )}
      </div>

      <div className="rounded-card bg-surface-soft p-5" aria-live="polite">
        {paceSeconds > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs font-semibold text-charcoal-500">Pace</p>
                <p className="font-barlow text-4xl font-bold text-charcoal-900">{formatPace(paceSeconds * km, km)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-charcoal-500">Finish time</p>
                <p className="font-barlow text-4xl font-bold text-charcoal-900">{formatDuration(Math.round(totalSeconds))}</p>
              </div>
            </div>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-charcoal-500"><th className="py-1">Split</th><th className="py-1 text-right">Elapsed</th></tr>
              </thead>
              <tbody>
                {splits.map((r) => (
                  <tr key={r.label} className="border-t border-charcoal-200">
                    <td className="py-1.5 font-semibold text-charcoal-800">{r.label}</td>
                    <td className="py-1.5 text-right tabular-nums text-charcoal-700">{formatDuration(Math.round(r.elapsed))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="py-8 text-center text-sm text-charcoal-500">Enter a valid time or pace.</p>
        )}
      </div>
    </div>
  );
}

const PHASE_TONE = { Base: "info", Build: "warning", Peak: "error", Taper: "success", "Race week": "brand" } as const;

function PlanViewer() {
  const [distance, setDistance] = useState("21.1 KM");
  const plan = useMemo(() => trainingPlan(distance), [distance]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Field label="Race category" htmlFor="plan-distance" className="w-full sm:w-64">
          <Select id="plan-distance" value={distance} onChange={(e) => setDistance(e.target.value)}>
            {CATEGORY_OPS.map((c) => (
              <option key={c.distance} value={c.distance}>{c.distance} ({c.planWeeks}-week plan)</option>
            ))}
          </Select>
        </Field>
        <p className="text-sm text-charcoal-600">
          {plan.daysToRace > 0 ? `${plan.daysToRace} days to race day` : "Race day has passed"}
          {plan.currentWeek === 0 && plan.weeksUntilStart > 0 ? ` · plan starts in ${plan.weeksUntilStart} weeks` : ""}
        </p>
      </div>
      <div className="overflow-x-auto rounded-card border border-charcoal-200">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-surface-soft text-left text-xs text-charcoal-500">
            <tr>
              <th className="px-3 py-2">Week</th><th className="px-3 py-2">Starts</th><th className="px-3 py-2">Phase</th>
              <th className="px-3 py-2 text-right">Weekly km</th><th className="px-3 py-2 text-right">Long run</th><th className="px-3 py-2">Focus</th>
            </tr>
          </thead>
          <tbody>
            {plan.weeks.map((w) => (
              <tr key={w.week} className={cn("border-t border-charcoal-200", plan.currentWeek === w.week && "bg-brand-red-light/40")}>
                <td className="px-3 py-2 font-semibold">{w.week}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatDate(w.weekStart)}</td>
                <td className="px-3 py-2"><Badge tone={PHASE_TONE[w.phase]}>{w.phase}</Badge></td>
                <td className="px-3 py-2 text-right tabular-nums">{w.weeklyKm}</td>
                <td className="px-3 py-2 text-right tabular-nums">{w.longRunKm} km</td>
                <td className="px-3 py-2 text-charcoal-600">{w.focus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TrainingTools() {
  const [tab, setTab] = useState<TabId>("plan");
  return (
    <Card padded={false}>
      <div className="flex gap-1 overflow-x-auto border-b border-charcoal-200 p-2" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "flex h-11 shrink-0 items-center gap-2 rounded-btn px-4 text-sm font-semibold",
              tab === id ? "bg-brand-red text-white" : "text-charcoal-700 hover:bg-charcoal-100"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden /> {label}
          </button>
        ))}
      </div>
      <div className="p-5 sm:p-6">
        {tab === "plan" ? <PlanViewer /> : tab === "pace" ? <PaceCalculator /> : <BmiCalculator />}
      </div>
    </Card>
  );
}
