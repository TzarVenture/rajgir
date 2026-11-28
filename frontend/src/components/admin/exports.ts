import * as XLSX from "xlsx";
import type { ApiAdminOverview, ApiRunnerRegistration } from "@/lib/api";

/** Excel downloads used by the Registrations and Reports sections (one implementation). */
export function downloadRunnersWorkbook(runners: ApiRunnerRegistration[], fileName: string) {
  const rows = runners.map((r) => ({
    RegistrationNumber: r.registrationNumber,
    BibNumber: r.bibNumber ?? "Unassigned",
    FullName: r.fullName,
    Email: r.email,
    Phone: r.phone,
    Distance: r.distance,
    TShirtSize: r.tshirtSize,
    Club: r.runningClub ?? "",
    NetAmount: r.netAmount,
    RegisteredOn: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }) : "",
    KitCollected: r.kitCollectedAt ? "Yes" : "Pending",
  }));
  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Runners");
  XLSX.writeFile(book, fileName);
}

export function downloadTshirtWorkbook(overview: ApiAdminOverview) {
  const sheet = XLSX.utils.json_to_sheet(overview.tshirtBreakdown.map((t) => ({ Size: t.size, Count: t.count })));
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "T-shirt sizes");
  XLSX.writeFile(book, "rajgir_marathon_tshirt_sizes.xlsx");
}

/** Template for the bulk bib upload. */
export function downloadBibTemplate() {
  const sample = [
    { RegistrationNumber: "RJG-2027-21K-1001", RunnerName: "Example Runner", Distance: "21.1 KM", BibNumber: "21001" },
    { RegistrationNumber: "RJG-2027-10K-1003", RunnerName: "Example Runner", Distance: "10 KM", BibNumber: "10001" },
  ];
  const sheet = XLSX.utils.json_to_sheet(sample);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Bibs");
  XLSX.writeFile(book, "rajgir_bib_allotment_template.xlsx");
}

/** Reads RegistrationNumber / BibNumber pairs from the first sheet of an uploaded .xlsx or .csv. */
export async function readBibRows(file: File): Promise<Array<{ registrationNumber: string; bibNumber: string }>> {
  const book = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheet = book.Sheets[book.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const out: Array<{ registrationNumber: string; bibNumber: string }> = [];
  for (const row of raw) {
    const registrationNumber = String(row.RegistrationNumber ?? row.registrationNumber ?? row.regNumber ?? "").trim();
    const bibNumber = String(row.BibNumber ?? row.bibNumber ?? row.bib ?? "").trim();
    if (registrationNumber && bibNumber) out.push({ registrationNumber, bibNumber });
  }
  return out;
}
