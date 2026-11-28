import { LuTimer } from "react-icons/lu";
import { Badge, EmptyState } from "@/components/ui";
import type { ApiRaceResult } from "@/lib/api";
import { formatDuration, formatPace, type CategoryOps } from "@/lib/event";

interface Row {
  label: string;
  km: number;
  cumulative: number;
  segment: number;
  segmentKm: number;
}

function buildRows(points: { label: string; km: number; elapsed: number }[]): Row[] {
  let prevKm = 0;
  let prevT = 0;
  return points.map((p) => {
    const row = { label: p.label, km: p.km, cumulative: p.elapsed, segment: p.elapsed - prevT, segmentKm: p.km - prevKm };
    prevKm = p.km;
    prevT = p.elapsed;
    return row;
  });
}

function Table({ rows, caption }: { rows: Row[]; caption: string }) {
  return (
    <div className="overflow-x-auto rounded-card border border-charcoal-200">
      <table className="w-full min-w-[560px] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-surface-soft text-xs text-charcoal-500">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-semibold">Checkpoint</th>
            <th scope="col" className="px-4 py-2.5 text-right font-semibold">Distance</th>
            <th scope="col" className="px-4 py-2.5 text-right font-semibold">Cumulative time</th>
            <th scope="col" className="px-4 py-2.5 text-right font-semibold">Split</th>
            <th scope="col" className="px-4 py-2.5 text-right font-semibold">Split pace</th>
            <th scope="col" className="px-4 py-2.5 text-right font-semibold">Average pace</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-charcoal-200">
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row" className="px-4 py-2.5 font-semibold text-charcoal-900">{r.label}</th>
              <td className="px-4 py-2.5 text-right tabular-nums">{r.km.toFixed(r.km % 1 ? 2 : 0)} km</td>
              <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-charcoal-900">{formatDuration(r.cumulative)}</td>
              <td className="px-4 py-2.5 text-right tabular-nums">{formatDuration(r.segment)}</td>
              <td className="px-4 py-2.5 text-right tabular-nums">{formatPace(r.segment, r.segmentKm)}</td>
              <td className="px-4 py-2.5 text-right tabular-nums">{formatPace(r.cumulative, r.km)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Official chip splits once results are published; before that, a target pace band at even pace
 * from the runner's expected finish time.
 */
export function SplitsMatrix({
  ops,
  result,
  targetSeconds,
}: {
  ops: CategoryOps;
  result: ApiRaceResult | null;
  targetSeconds: number | null;
}) {
  if (!ops.timed) {
    return (
      <EmptyState
        icon={LuTimer}
        title="Non-timed category"
        description={`The ${ops.distance} run is a non-competitive community run, so there are no timing mats or official splits.`}
      />
    );
  }

  if (result) {
    if (result.status !== "FINISHED") {
      const label = { DNF: "Did not finish", DNS: "Did not start", DSQ: "Disqualified" }[result.status] ?? result.status;
      return (
        <div className="space-y-3">
          <Badge tone="warning">{label}</Badge>
          {result.splits.length ? (
            <Table
              caption="Recorded checkpoint splits"
              rows={buildRows(result.splits.map((s) => ({ label: s.label, km: s.distanceKm, elapsed: s.elapsedSeconds })))}
            />
          ) : null}
        </div>
      );
    }
    const splits = [...result.splits];
    const finishKm = ops.distanceKm;
    if (result.netTimeSeconds && !splits.some((s) => Math.abs(s.distanceKm - finishKm) < 0.01)) {
      splits.push({ label: "Finish", distanceKm: finishKm, elapsedSeconds: result.netTimeSeconds });
    }
    return (
      <div className="space-y-4">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Net (chip) time", value: formatDuration(result.netTimeSeconds) },
            { label: "Gun time", value: formatDuration(result.gunTimeSeconds) },
            { label: "Average pace", value: result.netTimeSeconds ? formatPace(result.netTimeSeconds, finishKm) : "-" },
            { label: "Overall rank", value: result.overallRank ? `#${result.overallRank}` : "-" },
            { label: "Gender rank", value: result.genderRank ? `#${result.genderRank}` : "-" },
            { label: "Age-group rank", value: result.categoryRank ? `#${result.categoryRank}` : "-" },
          ].map((s) => (
            <div key={s.label} className="rounded-card border border-charcoal-200 bg-surface-soft p-3">
              <dt className="text-xs font-semibold text-charcoal-500">{s.label}</dt>
              <dd className="mt-1 font-barlow text-2xl font-bold tabular-nums text-charcoal-900">{s.value}</dd>
            </div>
          ))}
        </dl>
        <Table
          caption="Official chip splits"
          rows={buildRows(splits.sort((a, b) => a.distanceKm - b.distanceKm).map((s) => ({ label: s.label, km: s.distanceKm, elapsed: s.elapsedSeconds })))}
        />
        <p className="text-xs text-charcoal-500">Official chip times from the timing partner. Net time runs from when you crossed the start mat.</p>
      </div>
    );
  }

  if (targetSeconds) {
    const rows = buildRows(
      ops.checkpoints.map((c) => ({ label: c.label, km: c.km, elapsed: Math.round((targetSeconds * c.km) / ops.distanceKm) }))
    );
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-charcoal-600">
          <Badge tone="info">Target splits</Badge>
          <span>
            Even pace for your expected finish of <strong className="text-charcoal-900">{formatDuration(targetSeconds)}</strong>. Your official
            chip splits replace this table after the race.
          </span>
        </div>
        <Table caption="Target checkpoint splits at even pace" rows={rows} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-charcoal-600">
        Timing mats at {ops.checkpoints.map((c) => c.label).join(", ")}. Your official chip splits appear here after the race.
      </p>
      <EmptyState icon={LuTimer} title="No expected finish time on file" description="Contact the runner help desk to add one; it sets your target pace band." />
    </div>
  );
}
