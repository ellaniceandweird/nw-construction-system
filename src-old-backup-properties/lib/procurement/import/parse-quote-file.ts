import { matchVendorName, parseDateFlexible } from "@/lib/procurement/import/shared";
import type { ParsedQuoteFields } from "@/lib/procurement/import/shared";

/**
 * Extracts likely quote fields from an uploaded PDF's raw text.
 *
 * IMPORTANT HONEST LIMITATION: this is a heuristic text/keyword scan, not a
 * live AI model reading the document — the same kind of deterministic,
 * rule-based parser the app already uses for the Master Schedule's PDF
 * import (see lib/scheduling/import/parse-pdf.ts). It does reasonably well
 * on typical vendor quote layouts (a "Total"/"Quote Total" line, a
 * "Lead Time"/"Delivery" line, a "Warranty" line, etc.) but every field it
 * finds should be treated as a starting point — the review step below
 * requires confirming or correcting each one before it's saved.
 */

const CURRENCY = /\$\s?([\d,]+(?:\.\d{1,2})?)/g;
const DAYS_OR_WEEKS = /(\d{1,3})\s*(day|days|week|weeks|business day|business days)/i;
const DATE_PATTERN =
  /(\d{1,2}\/\d{1,2}\/\d{2,4})|(\d{4}-\d{1,2}-\d{1,2})|([A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4})/;

function parseCurrency(match: string): number {
  return parseFloat(match.replace(/[$,\s]/g, ""));
}

function findLineWithKeyword(lines: string[], keywords: RegExp[]): string | null {
  return lines.find((l) => keywords.some((k) => k.test(l))) ?? null;
}

function daysFromMatch(line: string): number | null {
  const m = line.match(DAYS_OR_WEEKS);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return /week/i.test(m[2]) ? n * 7 : n;
}

export async function extractPdfLines(file: File): Promise<string[]> {
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
    for (const y of sortedYs) {
      lines.push(byY.get(y)!.join(" ").trim());
    }
  }
  return lines.filter((l) => l.length > 0);
}

/** Parses an uploaded quote PDF into best-guess VendorQuoteResponse fields. */
export function parseQuoteLines(lines: string[], candidateVendorIds: string[]): ParsedQuoteFields {
  const rawText = lines.join("\n");
  const warnings: string[] = [];

  const vendorId = matchVendorName(rawText, candidateVendorIds);
  if (!vendorId) warnings.push("Couldn't match a vendor from the invited list — please select one");

  // Total price: prefer a line that explicitly says total/amount due; else the largest $ figure.
  const totalLine = findLineWithKeyword(lines, [
    /grand total/i,
    /quote total/i,
    /total due/i,
    /amount due/i,
    /^total\b/i,
    /\btotal:/i,
  ]);
  let quotedPrice: number | null = null;
  if (totalLine) {
    const m = [...totalLine.matchAll(CURRENCY)];
    if (m.length) quotedPrice = parseCurrency(m[m.length - 1][0]);
  }
  if (quotedPrice == null) {
    const allAmounts = [...rawText.matchAll(CURRENCY)].map((m) => parseCurrency(m[0]));
    if (allAmounts.length) {
      quotedPrice = Math.max(...allAmounts);
      warnings.push("Couldn't find a clearly labeled total — using the largest dollar amount found. Please verify.");
    } else {
      warnings.push("No price found — please enter it manually");
    }
  }

  // Lead time
  const leadLine = findLineWithKeyword(lines, [
    /lead time/i,
    /ships in/i,
    /ship date/i,
    /turnaround/i,
    /production time/i,
    /delivery time/i,
  ]);
  const leadTimeDays = leadLine ? daysFromMatch(leadLine) : null;
  if (leadTimeDays == null) warnings.push("Couldn't find a lead time — please enter it manually");

  // Freight / shipping
  const freightLine = findLineWithKeyword(lines, [/freight/i, /shipping/i, /delivery fee/i]);
  let freight: number | null = null;
  if (freightLine) {
    const m = [...freightLine.matchAll(CURRENCY)];
    if (m.length) freight = parseCurrency(m[0][0]);
  }

  // Tax
  const taxLine = findLineWithKeyword(lines, [/\btax\b/i, /sales tax/i]);
  let tax: number | null = null;
  if (taxLine) {
    const m = [...taxLine.matchAll(CURRENCY)];
    if (m.length) tax = parseCurrency(m[0][0]);
  }

  // Warranty
  const warrantyLine = findLineWithKeyword(lines, [/warrant/i]);
  const warranty = warrantyLine ?? "";

  // Validity period
  const validLine = findLineWithKeyword(lines, [/valid for/i, /quote valid/i, /good for \d/i]);
  const validityPeriodDays = validLine ? daysFromMatch(validLine) : null;

  // Quote / submitted date
  const dateLine = findLineWithKeyword(lines, [/quote date/i, /^date:/i, /\bdated\b/i]) ?? lines[0] ?? "";
  const dateMatch = dateLine.match(DATE_PATTERN);
  const submittedDate = dateMatch ? parseDateFlexible(dateMatch[0]) : "";
  if (!submittedDate) warnings.push("Couldn't find a quote date — defaulting to today");

  return {
    vendorId,
    vendorNameRaw: vendorId ? "" : rawText.slice(0, 120),
    quotedPrice,
    leadTimeDays,
    freight,
    tax,
    warranty,
    validityPeriodDays,
    submittedDate: submittedDate || new Date().toISOString().slice(0, 10),
    notes: "",
    warnings,
    rawText,
  };
}

export async function parseQuotePdfFile(
  file: File,
  candidateVendorIds: string[]
): Promise<ParsedQuoteFields> {
  const lines = await extractPdfLines(file);
  return parseQuoteLines(lines, candidateVendorIds);
}
