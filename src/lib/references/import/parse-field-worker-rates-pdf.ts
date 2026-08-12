import type { ParsedFieldWorkerRatesFile, ParsedFieldWorkerRateRow } from "@/lib/references/import/parse-field-worker-rates-excel";

async function extractPdfLines(file: File): Promise<string[]> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  const buffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
  const lines: string[] = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const byY = new Map<number, string[]>();
    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform[5]);
      if (!byY.has(y)) byY.set(y, []);
      byY.get(y)!.push(item.str);
    }
    const sortedYs = [...byY.keys()].sort((a, b) => b - a);
    for (const y of sortedYs) lines.push(byY.get(y)!.join(" ").trim());
  }
  return lines.filter((l) => l.length > 0);
}

/** Best-effort — looks for "Name ... $rate" per line; falls back to name-only when no dollar amount is found. */
export async function parseFieldWorkerRatesPdfFile(file: File): Promise<ParsedFieldWorkerRatesFile> {
  const lines = await extractPdfLines(file);
  const rows: ParsedFieldWorkerRateRow[] = [];
  let counter = 0;

  for (const line of lines) {
    if (line.length < 3 || /^(page|date|rate sheet)\b/i.test(line)) continue;
    const rateMatch = line.match(/\$?(\d+(?:\.\d{1,2})?)\s*(?:\/\s*hr|per hour|\/hour)?$/);
    const namePart = rateMatch ? line.slice(0, rateMatch.index).trim() : line.trim();
    if (!namePart) continue;
    counter += 1;
    rows.push({
      employeeId: `EMP-IMPORT-${counter}`,
      employeeName: namePart.replace(/[-:]\s*$/, "").trim(),
      trade: "General",
      hourlyRate: rateMatch ? parseFloat(rateMatch[1]) : 0,
    });
  }

  return {
    rows,
    warnings: [
      "PDF parsing is best-effort — rates only came through where a dollar amount appeared on the same line as a name. Review every row before saving.",
    ],
  };
}
