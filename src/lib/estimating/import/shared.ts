import type { EstimateLineItem } from "@/types/estimating";

export interface ParsedEstimateFile {
  projectNameGuess: string;
  addressGuess: string;
  lineItems: Omit<EstimateLineItem, "totalCost">[];
  contingency: { constructionContingencyPercent?: number; insurancePercent?: number; salesTaxPercent?: number };
  warnings: string[];
}

export function normalizeHeader(h: string) {
  return h.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function findColumn(headers: string[], candidates: string[]): number {
  const normalized = headers.map(normalizeHeader);
  for (const candidate of candidates) {
    const idx = normalized.findIndex((h) => h.includes(candidate));
    if (idx !== -1) return idx;
  }
  return -1;
}

export function parseNumber(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[$,\s]/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? null : n;
  }
  return null;
}
