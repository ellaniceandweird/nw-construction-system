import * as XLSX from "xlsx";

import { findColumn } from "@/lib/estimating/import/shared";

export interface ParsedBillingEntityRow {
  companyName: string;
  legalName?: string;
  taxId?: string;
  address?: string;
  invoicePrefix?: string;
  defaultPaymentTerms?: string;
}

export interface ParsedBillingEntitiesFile {
  rows: ParsedBillingEntityRow[];
  warnings: string[];
}

/** Parses a billing entities list — header row with columns like Company Name, Legal Name, Tax ID, Address, Invoice Prefix, Payment Terms (matched flexibly, any order). */
export async function parseBillingEntitiesExcelFile(file: File): Promise<ParsedBillingEntitiesFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

  const headerRowIndex = rows.findIndex((r) => {
    const texts = r.map((c) => (typeof c === "string" ? c.toLowerCase() : ""));
    return texts.some((t) => t.includes("company") || t.includes("entity"));
  });

  if (headerRowIndex === -1) {
    return { rows: [], warnings: ["Couldn't find a header row with a Company Name column."] };
  }

  const headers = rows[headerRowIndex].map((h) => String(h ?? ""));
  const companyCol = findColumn(headers, ["companyname", "company", "entity", "entityname"]);
  const legalCol = findColumn(headers, ["legalname", "legal"]);
  const taxIdCol = findColumn(headers, ["taxid", "ein", "tax"]);
  const addressCol = findColumn(headers, ["address"]);
  const prefixCol = findColumn(headers, ["invoiceprefix", "prefix"]);
  const termsCol = findColumn(headers, ["paymentterms", "terms"]);

  const parsed: ParsedBillingEntityRow[] = [];
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => c === undefined || c === "")) continue;

    const companyName = companyCol !== -1 ? String(row[companyCol] ?? "").trim() : "";
    if (!companyName) continue;

    parsed.push({
      companyName,
      legalName: legalCol !== -1 ? String(row[legalCol] ?? "").trim() || undefined : undefined,
      taxId: taxIdCol !== -1 ? String(row[taxIdCol] ?? "").trim() || undefined : undefined,
      address: addressCol !== -1 ? String(row[addressCol] ?? "").trim() || undefined : undefined,
      invoicePrefix: prefixCol !== -1 ? String(row[prefixCol] ?? "").trim() || undefined : undefined,
      defaultPaymentTerms: termsCol !== -1 ? String(row[termsCol] ?? "").trim() || undefined : undefined,
    });
  }

  const warnings: string[] = [];
  if (parsed.length === 0) {
    warnings.push("Found the header row but no rows with a Company Name filled in.");
  }

  return { rows: parsed, warnings };
}
