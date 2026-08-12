import * as XLSX from "xlsx";

import { findColumn } from "@/lib/estimating/import/shared";

export interface ParsedCostCodeRow {
  code: string;
  description: string;
  division: string;
  trade?: string;
  category?: string;
}

export interface ParsedCostCodesFile {
  rows: ParsedCostCodeRow[];
  warnings: string[];
}

/**
 * Parses a cost code library file — a header row with columns like Code,
 * Description, Division, Trade, Category (in any order, matched flexibly).
 */
export async function parseCostCodesExcelFile(file: File): Promise<ParsedCostCodesFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

  const headerRowIndex = rows.findIndex((r) => {
    const texts = r.map((c) => (typeof c === "string" ? c.toLowerCase() : ""));
    return texts.some((t) => t.includes("code")) && texts.some((t) => t.includes("description"));
  });

  if (headerRowIndex === -1) {
    return { rows: [], warnings: ["Couldn't find a header row with Code and Description columns."] };
  }

  const headers = rows[headerRowIndex].map((h) => String(h ?? ""));
  const codeCol = findColumn(headers, ["code", "costcode"]);
  const descriptionCol = findColumn(headers, ["description"]);
  const divisionCol = findColumn(headers, ["division"]);
  const tradeCol = findColumn(headers, ["trade"]);
  const categoryCol = findColumn(headers, ["category"]);

  const parsed: ParsedCostCodeRow[] = [];
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => c === undefined || c === "")) continue;

    const code = codeCol !== -1 ? String(row[codeCol] ?? "").trim() : "";
    const description = descriptionCol !== -1 ? String(row[descriptionCol] ?? "").trim() : "";
    if (!code || !description) continue;

    parsed.push({
      code,
      description,
      division: divisionCol !== -1 ? String(row[divisionCol] ?? "").trim() || "Uncategorized" : "Uncategorized",
      trade: tradeCol !== -1 ? String(row[tradeCol] ?? "").trim() || undefined : undefined,
      category: categoryCol !== -1 ? String(row[categoryCol] ?? "").trim() || undefined : undefined,
    });
  }

  const warnings: string[] = [];
  if (parsed.length === 0) {
    warnings.push("Found the header row but no rows with both a Code and a Description filled in.");
  }
  if (divisionCol === -1) {
    warnings.push("No Division column found — imported codes will show as \"Uncategorized\" until you edit them.");
  }

  return { rows: parsed, warnings };
}
