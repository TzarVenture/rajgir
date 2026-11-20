"use client";

/**
 * Prints one element (certificate, receipt, pass) on its own page.
 * Copies the element and the page's stylesheets into a hidden iframe so the rest of the dashboard is not printed.
 */
export function printElement(element: HTMLElement | null, title: string): void {
  if (!element) return;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    iframe.remove();
    window.print();
    return;
  }

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((node) => node.outerHTML)
    .join("\n");

  doc.open();
  doc.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${title.replace(/[<>&"]/g, "")}</title>${styles}` +
      `<style>@page{margin:12mm}body{background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}</style>` +
      `</head><body>${element.outerHTML}</body></html>`
  );
  doc.close();

  const cleanup = () => setTimeout(() => iframe.remove(), 500);
  const run = () => {
    win.focus();
    win.print();
    cleanup();
  };
  // Give stylesheets and images a moment to load inside the frame.
  if (doc.readyState === "complete") setTimeout(run, 300);
  else iframe.onload = () => setTimeout(run, 300);
}
