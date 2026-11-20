// Server components only (uses Node's Buffer).
import QRCode from "qrcode";

/** Payload printed in the runner's QR (scanned at the expo bib desk). Format kept stable for scanners. */
export function runnerQrPayload(registrationNumber: string, token: string | null | undefined): string {
  return `RAJGIR-MARATHON:${registrationNumber}:${token ?? ""}`;
}

/**
 * QR code as an SVG data URL, generated on our server.
 * (Never send the token to a third-party QR service: it is the runner's pickup credential.)
 */
export async function qrDataUrl(text: string): Promise<string> {
  const svg = await QRCode.toString(text, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#111827", light: "#FFFFFF" } });
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
