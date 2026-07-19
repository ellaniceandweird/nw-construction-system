import { parseNumber } from "@/lib/estimating/import/shared";
import type { ParsedEstimateFile } from "@/lib/estimating/import/shared";
import type { EstimateLineItem } from "@/types/estimating";

/**
 * Best-effort PDF budget parser. PDFs lose real column structure, so this
 * is meaningfully less reliable than the Excel parser — it looks for
 * lines ending in a pattern like "<qty> <unit> $<unit cost> $<total>" and
 * treats everything before that as the description. Every result needs
 * review; this is explicitly flagged as lower-confidence than the Excel
 * path in the UI.
 */
const LINE_PATTERN = /^(.*?)\s+([\d,]+(?:\.\d+)?)\s+([A-Za-z]{1,6})\s+\$?([\d,]+(?:\.\d{1,2})?)\s+\$?([\d,]+(?:\.\d{1,2})?)\s*$/;
const CONTINGENCY_KEYWORD = /contingency/i;
const INSURANCE_KEYWORD = /insurance/i;
const PERCENT_PATTERN = /(\d+(?:\.\d+)?)\s*%/;

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

export async function parseEstimatePdfFile(file: File): Promise<ParsedEstimateFile> {
  const lines = await extractPdfLines(file);
  const warnings: string[] = [
    "PDF parsing is best-effort — PDFs don't preserve table columns the way Excel does. Review every line item carefully.",
  ];

  const lineItems: Omit<EstimateLineItem, "totalCost">[] = [];
  const contingency: ParsedEstimateFile["contingency"] = {};

  for (const line of lines) {
    if (CONTINGENCY_KEYWORD.test(line)) {
      const m = line.match(PERCENT_PATTERN);
      if (m) contingency.constructionContingencyPercent = parseFloat(m[1]);
      continue;
    }
    if (INSURANCE_KEYWORD.test(line)) {
      const m = line.match(PERCENT_PATTERN);
      if (m) contingency.insurancePercent = parseFloat(m[1]);
      continue;
    }

    const match = line.match(LINE_PATTERN);
    if (!match) continue;
    const [, description, qtyStr, unit, unitCostStr, totalStr] = match;
    const quantity = parseNumber(qtyStr);
    const unitCost = parseNumber(unitCostStr);
    const total = parseNumber(totalStr);
    if (quantity == null || unitCost == null || total == null || !description.trim()) continue;

    lineItems.push({
      description: description.trim(),
      quantity,
      unit,
      costCode: "",
      laborCost: 0,
      materialCost: total,
      equipmentCost: 0,
      subcontractCost: 0,
      markupPercent: 0,
    });
  }

  if (lineItems.length === 0) {
    warnings.push("Couldn't confidently detect any line items in this PDF's text layout — try the Excel version of this file if you have one, or add line items manually.");
  }

  return { projectNameGuess: "", addressGuess: "", lineItems, contingency, warnings };
}
