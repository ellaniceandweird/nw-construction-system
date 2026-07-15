import type { ParsedBillingEntitiesFile, ParsedBillingEntityRow } from "@/lib/financial/import/parse-billing-entities-excel";

/**
 * Best-effort PDF parser for a billing entities list. PDFs don't preserve
 * table columns, so this only reliably picks up a company name per line —
 * legal name, tax ID, address, and terms need to be filled in manually
 * during review. Excel/CSV is far more reliable for this kind of list.
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

export async function parseBillingEntitiesPdfFile(file: File): Promise<ParsedBillingEntitiesFile> {
  const lines = await extractPdfLines(file);
  const rows: ParsedBillingEntityRow[] = lines
    .filter((l) => l.length > 2 && l.length < 80 && !/^(page|date|address|terms)\b/i.test(l))
    .map((l) => ({ companyName: l }));

  return {
    rows,
    warnings: [
      "PDF parsing is best-effort — only company names were detected. Fill in legal name, tax ID, address, and payment terms manually below.",
    ],
  };
}
