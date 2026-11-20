import React from "react";
import { EVENT, TAX, formatDuration, formatPace, formatDate } from "@/lib/event";
import type { ApiRunnerRegistration } from "@/lib/api";
import type { CertificateData } from "@/components/dashboard/CertificateModal";

export function hhmmToSeconds(value: string | null): number | null {
  const m = value?.match(/^(\d{1,2}):(\d{2})$/);
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 : null;
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

/** GST-inclusive amount split into taxable value and tax (CGST+SGST within the organizer's state, else IGST). */
export function gstBreakdown(totalInclusive: number, buyerState: string) {
  const rate = TAX.gstRatePercent;
  const taxable = round2(totalInclusive / (1 + rate / 100));
  const tax = round2(totalInclusive - taxable);
  const intraState = buyerState.trim().toLowerCase() === TAX.organizerState.toLowerCase();
  return intraState
    ? {
        taxable,
        lines: [
          { label: `CGST @ ${rate / 2}%`, amount: round2(tax / 2) },
          { label: `SGST @ ${rate / 2}%`, amount: round2(tax - round2(tax / 2)) },
        ],
      }
    : { taxable, lines: [{ label: `IGST @ ${rate}%`, amount: tax }] };
}

export function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = (h * 60 + m + minutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function computeCertificate(
  r: ApiRunnerRegistration,
  fullName: string,
  ageGroup: string,
  ops: { timed: boolean; distanceKm: number },
  raceOver: boolean
): { certificate: CertificateData | null; lockedReason: string } {
  let certificate: CertificateData | null = null;
  let lockedReason = "";

  if (ops.timed) {
    if (r.result?.status === "FINISHED") {
      certificate = {
        heading: "Certificate of Achievement",
        recipient: fullName,
        statement: (
          <>
            successfully completed the <strong>{r.distance} {r.raceTitle}</strong> at the {EVENT.name}, {EVENT.city}, on{" "}
            {formatDate(EVENT.raceDate)}.
          </>
        ),
        highlights: [
          { label: "Net time", value: formatDuration(r.result.netTimeSeconds) },
          { label: "Pace", value: r.result.netTimeSeconds ? formatPace(r.result.netTimeSeconds, ops.distanceKm).replace(" /km", "/km") : "-" },
          { label: "Overall", value: r.result.overallRank ? `#${r.result.overallRank}` : "-" },
          { label: ageGroup, value: r.result.categoryRank ? `#${r.result.categoryRank}` : "-" },
        ],
        certificateId: `${r.registrationNumber}${r.bibNumber ? ` / BIB ${r.bibNumber}` : ""}`,
        issuedOn: formatDate(r.result.publishedAt),
        signatory: "Race Director, Rajgir Marathon",
      };
    } else if (r.result) {
      lockedReason = "A finisher certificate is issued only for official finishes. Contact the help desk if you believe your result is wrong.";
    } else {
      lockedReason = `Your finisher certificate unlocks here when official results are published after race day (${formatDate(EVENT.raceDate)}).`;
    }
  } else if (raceOver && r.kitCollectedAt) {
    certificate = {
      heading: "Certificate of Participation",
      recipient: fullName,
      statement: (
        <>
          took part in the <strong>{r.distance} {r.raceTitle}</strong> at the {EVENT.name}, {EVENT.city}, on {formatDate(EVENT.raceDate)}.
        </>
      ),
      highlights: [],
      certificateId: r.registrationNumber,
      issuedOn: formatDate(EVENT.raceDate),
      signatory: "Race Director, Rajgir Marathon",
    };
  } else {
    lockedReason = `Your participation certificate unlocks after race day (${formatDate(EVENT.raceDate)}) for runners who collected their race kit.`;
  }

  return { certificate, lockedReason };
}
