"use client";

import { LuPrinter } from "react-icons/lu";
import { Button } from "@/components/ui";
import { printElement } from "@/lib/print";

/** Prints the element with the given id on its own page (receipts, certificates). */
export function PrintSectionButton({ targetId, title, label = "Print / save PDF" }: { targetId: string; title: string; label?: string }) {
  return (
    <Button variant="secondary" size="md" icon={LuPrinter} onClick={() => printElement(document.getElementById(targetId), title)}>
      {label}
    </Button>
  );
}
