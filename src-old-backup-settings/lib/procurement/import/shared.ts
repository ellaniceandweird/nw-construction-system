import { MOCK_VENDORS } from "@/lib/data/mock/vendors";

/**
 * A quote extracted from an uploaded file, before the person has
 * reviewed/corrected it. Nothing is written to the RFQ's responses until
 * they explicitly confirm the review step.
 */
export interface ParsedQuoteFields {
  vendorId: string | null;
  vendorNameRaw: string;
  quotedPrice: number | null;
  leadTimeDays: number | null;
  freight: number | null;
  tax: number | null;
  warranty: string;
  validityPeriodDays: number | null;
  submittedDate: string; // ISO yyyy-mm-dd, "" if unparseable
  notes: string;
  /** Problems found during parsing — shown to the person before they confirm. */
  warnings: string[];
  /** Raw extracted text, shown for reference / manual double-checking. */
  rawText: string;
}

/** Best-effort fuzzy match of free text against the known vendor list. */
export function matchVendorName(text: string, candidateIds?: string[]): string | null {
  const pool = candidateIds
    ? MOCK_VENDORS.filter((v) => candidateIds.includes(v.id))
    : MOCK_VENDORS;
  const normalized = text.toLowerCase();

  const exact = pool.find((v) => normalized.includes(v.vendorName.toLowerCase()));
  if (exact) return exact.id;

  // Try matching on the first significant word of the vendor name (e.g. "Hudson", "Catskill")
  const byFirstWord = pool.find((v) => {
    const firstWord = v.vendorName.split(/\s+/)[0].toLowerCase();
    return firstWord.length > 3 && normalized.includes(firstWord);
  });
  return byFirstWord?.id ?? null;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/** Parses common date formats found on invoices/quotes into ISO yyyy-mm-dd. */
export function parseDateFlexible(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  const mdy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (mdy) {
    const [, m, d, y] = mdy;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${pad(parseInt(m))}-${pad(parseInt(d))}`;
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
  }
  return "";
}
