"use client";

import { useRef, useState } from "react";
import { LuHeartPulse, LuPrinter, LuRefreshCw } from "react-icons/lu";
import { Button } from "@/components/ui";
import { printElement } from "@/lib/print";

export interface BibPassData {
  eventName: string;
  registrationNumber: string;
  bibNumber: string | null;
  bibName: string;
  distance: string;
  raceTitle: string;
  startWave: string | null;
  startLabel: string;
  timed: boolean;
  color: string;
  ink: string;
  qrDataUrl: string;
  fullName: string;
  bloodGroup: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  hasMedicalNotes: boolean;
}

/**
 * Digital bib pass that flips in 3D: the front mirrors the printed bib, the back carries the expo QR and the
 * emergency details that are printed on the back of every race bib.
 */
export function BibFlipCard({ data }: { data: BibPassData }) {
  const [flipped, setFlipped] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const bibLabel = data.bibNumber ?? "TBA";

  const front = (
    <div className="flex h-full flex-col overflow-hidden rounded-feature border border-charcoal-200 bg-white shadow-[0_8px_24px_rgba(17,24,39,0.12)]">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5" style={{ backgroundColor: data.color, color: data.ink }}>
        <span className="font-barlow text-sm font-bold uppercase tracking-wide sm:text-base">{data.eventName}</span>
        <span className="font-barlow text-sm font-bold uppercase sm:text-base">{data.distance}</span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <span
          className="font-barlow text-[64px] font-bold leading-none tracking-tight text-charcoal-900 sm:text-[80px]"
          aria-label={data.bibNumber ? `Bib number ${data.bibNumber}` : "Bib number to be allotted"}
        >
          {bibLabel}
        </span>
        <span className="mt-1 max-w-full break-words text-center font-barlow text-xl font-bold uppercase tracking-wider text-charcoal-800 sm:text-2xl">
          {data.bibName}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-charcoal-200 px-4 py-2 text-[11px] font-semibold text-charcoal-600 sm:text-xs">
        <span className="break-words font-medium">{data.raceTitle}</span>
        <span className="shrink-0">
          {data.startWave ? `Wave ${data.startWave} | ` : ""}
          {data.startLabel}
        </span>
      </div>
      <div className="h-2" style={{ backgroundColor: data.color }} />
    </div>
  );

  const back = (
    <div className="flex h-full flex-col overflow-hidden rounded-feature border border-charcoal-200 bg-white shadow-[0_8px_24px_rgba(17,24,39,0.12)]">
      <div className="flex items-center justify-between gap-2 bg-charcoal-900 px-4 py-2.5 text-white">
        <span className="font-barlow text-sm font-bold uppercase tracking-wide sm:text-base">Expo pass and emergency info</span>
      </div>
      <div className="grid flex-1 grid-cols-[auto_1fr] items-center gap-3 p-3 sm:gap-4 sm:p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.qrDataUrl} alt={`QR code for registration ${data.registrationNumber}`} className="h-24 w-24 sm:h-32 sm:w-32" />
        <dl className="min-w-0 space-y-1.5 text-xs sm:text-sm">
          <div>
            <dt className="text-charcoal-500">Runner</dt>
            <dd className="break-words font-bold text-charcoal-900">{data.fullName}</dd>
          </div>
          <div>
            <dt className="text-charcoal-500">Blood group</dt>
            <dd className="font-bold text-brand-red">{data.bloodGroup}</dd>
          </div>
          <div>
            <dt className="text-charcoal-500">Emergency contact</dt>
            <dd className="break-words font-bold text-charcoal-900">
              {data.emergencyName} ({data.emergencyRelation})
            </dd>
            <dd className="font-mono font-semibold text-charcoal-800">+91 {data.emergencyPhone}</dd>
          </div>
        </dl>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-charcoal-200 px-4 py-2 text-[11px] font-semibold text-charcoal-600 sm:text-xs">
        <span className="font-mono">{data.registrationNumber}</span>
        {data.hasMedicalNotes ? (
          <span className="flex items-center gap-1 text-brand-red-dark">
            <LuHeartPulse className="h-3.5 w-3.5" aria-hidden /> Medical note on file
          </span>
        ) : (
          <span>Scan at the bib desk</span>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="[perspective:1400px]">
        <div
          className={`relative aspect-[4/3] w-full transition-transform duration-700 [transform-style:preserve-3d] motion-reduce:transition-none sm:aspect-[16/10] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <div className="absolute inset-0 [backface-visibility:hidden]" aria-hidden={flipped} inert={flipped}>
            {front}
          </div>
          <div
            className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
            aria-hidden={!flipped}
            inert={!flipped}
          >
            {back}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="md" icon={LuRefreshCw} onClick={() => setFlipped((v) => !v)} aria-pressed={flipped}>
          {flipped ? "Show front" : "Show back (QR)"}
        </Button>
        <Button
          variant="tertiary"
          size="md"
          icon={LuPrinter}
          onClick={() => printElement(printRef.current, `Bib pass ${data.registrationNumber}`)}
        >
          Print pass
        </Button>
      </div>

      {/* Print layout: both sides, one under the other. */}
      <div className="hidden">
        <div ref={printRef} className="mx-auto max-w-[560px] space-y-6 p-4">
          <div className="aspect-[16/10]">{front}</div>
          <div className="aspect-[16/10]">{back}</div>
        </div>
      </div>
    </div>
  );
}
