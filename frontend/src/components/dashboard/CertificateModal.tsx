"use client";

import { useRef, useState, type ReactNode } from "react";
import { LuAward, LuLock, LuPrinter } from "react-icons/lu";
import { Button, Modal } from "@/components/ui";
import { printElement } from "@/lib/print";

export interface CertificateData {
  /** e.g. "Certificate of Achievement" / "Certificate of Appreciation". */
  heading: string;
  recipient: string;
  /** Sentence under the name. */
  statement: ReactNode;
  /** Key figures shown in a row (time, rank, hours...). */
  highlights: { label: string; value: string }[];
  certificateId: string;
  issuedOn: string;
  signatory: string;
}

/**
 * Shared certificate viewer for runners (finisher / participation) and volunteers (service).
 * When `certificate` is null, the button stays locked and explains when it unlocks.
 */
export function CertificateModal({
  certificate,
  lockedReason,
  buttonLabel,
}: {
  certificate: CertificateData | null;
  lockedReason: string;
  buttonLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  if (!certificate) {
    return (
      <div className="flex items-start gap-3 rounded-card border border-dashed border-charcoal-300 bg-surface-soft p-4">
        <LuLock className="mt-0.5 h-5 w-5 shrink-0 text-charcoal-500" aria-hidden />
        <p className="text-sm text-charcoal-600">{lockedReason}</p>
      </div>
    );
  }

  return (
    <>
      <Button icon={LuAward} size="md" onClick={() => setOpen(true)}>
        {buttonLabel}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={certificate.heading}
        size="xl"
        footer={
          <div className="flex justify-end">
            <Button icon={LuPrinter} size="md" onClick={() => printElement(ref.current, `${certificate.heading} - ${certificate.recipient}`)}>
              Print / save PDF
            </Button>
          </div>
        }
      >
        <div ref={ref}>
          <div className="relative overflow-hidden rounded-feature border-[6px] border-double border-brand-gold-deep bg-surface-warm px-5 py-8 text-center sm:px-12 sm:py-12">
            <div className="absolute inset-x-0 top-0 h-2 bg-brand-red" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/rajgir_new_logo.png" alt="Rajgir Marathon" className="mx-auto h-12 w-auto object-contain sm:h-16" />
            <p className="mt-4 font-barlow text-sm font-bold uppercase tracking-[0.3em] text-brand-gold-deep">Rajgir Marathon 2027</p>
            <h3 className="mt-2 font-barlow text-3xl font-bold uppercase text-charcoal-900 sm:text-5xl">{certificate.heading}</h3>
            <p className="mt-6 text-sm text-charcoal-600">This is to certify that</p>
            <p className="mt-2 break-words font-barlow text-3xl font-bold text-brand-red sm:text-5xl">{certificate.recipient}</p>
            <div className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-charcoal-700 sm:text-base">{certificate.statement}</div>

            {certificate.highlights.length ? (
              <dl className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                {certificate.highlights.map((h) => (
                  <div key={h.label} className="rounded-card border border-[#F3DFA8] bg-white px-2 py-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-500">{h.label}</dt>
                    <dd className="mt-1 font-barlow text-2xl font-bold tabular-nums text-charcoal-900">{h.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <div className="mt-10 flex flex-col items-center justify-between gap-6 text-left sm:flex-row sm:items-end">
              <div className="text-xs text-charcoal-500">
                <p>
                  Certificate ID: <span className="font-mono font-semibold text-charcoal-800">{certificate.certificateId}</span>
                </p>
                <p>Issued: {certificate.issuedOn}</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-1 h-px w-48 bg-charcoal-400" aria-hidden />
                <p className="text-xs font-semibold text-charcoal-700">{certificate.signatory}</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
