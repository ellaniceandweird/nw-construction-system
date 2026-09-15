import type { ParsedCostTransactionsFile, ParsedCostTransactionRow } from "@/lib/financial/import/parse-cost-transactions-excel";

/**
 * Best-effort PDF parser for a cost ledger / receipt list. PDFs don't
 * preserve table columns, so this looks for a dollar amount on each
 * line and treats the rest of that line as the description — reliable
 * enough for a simple receipt or invoice list, but Excel/CSV is far
 * more accurate for anything with real columns (project, cost code,
 * category). Project, cost code, and category always need a manual
 * fill-in during review since a PDF has no way to signal those.
 */
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

const AMOUNT_PATTERN = /\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*$/;

export async function parseCostTransactionsPdfFile(file: File): Promise<ParsedCostTransactionsFile> {
  const lines = await extractPdfLines(file);
  const today = new Date().toISOString().slice(0, 10);

  const rows: ParsedCostTransactionRow[] = [];
  for (const line of lines) {
    if (line.length < 4 || /^(page|date|total|subtotal)\b/i.test(line)) continue;
    const match = line.match(AMOUNT_PATTERN);
    if (!match) continue;
    const amount = parseFloat(match[1].replace(/,/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) continue;
    const description = line.slice(0, match.index).trim().replace(/[-:]+$/, "").trim();
    if (!description) continue;
    rows.push({ projectName: "", date: today, description, amount });
  }

  return {
    rows,
    warnings: [
      "PDF parsing is best-effort — only description and amount were detected per line. Project, cost code, and category need a manual fill-in below.",
    ],
  };
}
