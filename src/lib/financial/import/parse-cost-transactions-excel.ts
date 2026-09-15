import * as XLSX from "xlsx";

import { findColumn } from "@/lib/estimating/import/shared";

export interface ParsedCostTransactionRow {
  projectName: string;
  date: string;
  description: string;
  costCode?: string;
  category?: string;
  amount: number;
  referenceNumber?: string;
}

export interface ParsedCostTransactionsFile {
  rows: ParsedCostTransactionRow[];
  warnings: string[];
}

function toDateString(cell: unknown): string {
  if (cell instanceof Date) return cell.toISOString().slice(0, 10);
  const text = String(cell ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

/** Parses a cost ledger list — header row with columns like Project, Date, Description, Cost Code, Category, Amount, Reference # (matched flexibly, any order). */
export async function parseCostTransactionsExcelFile(file: File): Promise<ParsedCostTransactionsFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

  const headerRowIndex = rows.findIndex((r) => {
    const texts = r.map((c) => (typeof c === "string" ? c.toLowerCase() : ""));
    return texts.some((t) => t.includes("description") || t.includes("amount"));
  });

  if (headerRowIndex === -1) {
    return { rows: [], warnings: ["Couldn't find a header row with a Description or Amount column."] };
  }

  const headers = rows[headerRowIndex].map((h) => String(h ?? ""));
  const projectCol = findColumn(headers, ["project", "projectname"]);
  const dateCol = findColumn(headers, ["date"]);
  const descCol = findColumn(headers, ["description", "desc"]);
  const costCodeCol = findColumn(headers, ["costcode", "code"]);
  const categoryCol = findColumn(headers, ["category"]);
  const amountCol = findColumn(headers, ["amount", "cost", "total"]);
  const refCol = findColumn(headers, ["reference", "referencenumber", "ref", "receipt"]);

  const parsed: ParsedCostTransactionRow[] = [];
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => c === undefined || c === "")) continue;

    const description = descCol !== -1 ? String(row[descCol] ?? "").trim() : "";
    const amountRaw = amountCol !== -1 ? row[amountCol] : undefined;
    const amount = typeof amountRaw === "number" ? amountRaw : parseFloat(String(amountRaw ?? "").replace(/[$,]/g, ""));
    if (!description || !Number.isFinite(amount)) continue;

    parsed.push({
      projectName: projectCol !== -1 ? String(row[projectCol] ?? "").trim() : "",
      date: dateCol !== -1 ? toDateString(row[dateCol]) : new Date().toISOString().slice(0, 10),
      description,
      costCode: costCodeCol !== -1 ? String(row[costCodeCol] ?? "").trim() || undefined : undefined,
      category: categoryCol !== -1 ? String(row[categoryCol] ?? "").trim() || undefined : undefined,
      amount,
      referenceNumber: refCol !== -1 ? String(row[refCol] ?? "").trim() || undefined : undefined,
    });
  }

  const warnings: string[] = [];
  if (parsed.length === 0) {
    warnings.push("Found the header row but no rows with both a Description and a numeric Amount filled in.");
  }

  return { rows: parsed, warnings };
}
