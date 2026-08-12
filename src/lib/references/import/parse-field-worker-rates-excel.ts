import * as XLSX from "xlsx";
import { findColumn } from "@/lib/estimating/import/shared";

export interface ParsedFieldWorkerRateRow {
  employeeId: string;
  employeeName: string;
  trade: string;
  hourlyRate: number;
  overtimeRate?: number;
  defaultCostCode?: string;
}
export interface ParsedFieldWorkerRatesFile { rows: ParsedFieldWorkerRateRow[]; warnings: string[]; }

export async function parseFieldWorkerRatesExcelFile(file: File): Promise<ParsedFieldWorkerRatesFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

  const headerRowIndex = rows.findIndex((r) => {
    const texts = r.map((c) => (typeof c === "string" ? c.toLowerCase() : ""));
    return texts.some((t) => t.includes("name") || t.includes("employee"));
  });
  if (headerRowIndex === -1) return { rows: [], warnings: ["Couldn't find a header row with an Employee Name column."] };

  const headers = rows[headerRowIndex].map((h) => String(h ?? ""));
  const idCol = findColumn(headers, ["employeeid", "id"]);
  const nameCol = findColumn(headers, ["employeename", "name"]);
  const tradeCol = findColumn(headers, ["trade", "role"]);
  const rateCol = findColumn(headers, ["hourlyrate", "rate", "payrate"]);
  const otCol = findColumn(headers, ["overtimerate", "otrate", "overtime"]);
  const costCodeCol = findColumn(headers, ["costcode", "defaultcostcode"]);

  const parsed: ParsedFieldWorkerRateRow[] = [];
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => c === undefined || c === "")) continue;
    const employeeName = nameCol !== -1 ? String(row[nameCol] ?? "").trim() : "";
    const hourlyRate = rateCol !== -1 ? parseFloat(String(row[rateCol] ?? "")) : NaN;
    if (!employeeName || Number.isNaN(hourlyRate)) continue;

    parsed.push({
      employeeId: idCol !== -1 ? String(row[idCol] ?? "").trim() : `EMP-IMPORT-${i}`,
      employeeName,
      trade: tradeCol !== -1 ? String(row[tradeCol] ?? "").trim() : "General",
      hourlyRate,
      overtimeRate: otCol !== -1 && row[otCol] !== undefined ? parseFloat(String(row[otCol])) : undefined,
      defaultCostCode: costCodeCol !== -1 ? String(row[costCodeCol] ?? "").trim() || undefined : undefined,
    });
  }

  const warnings: string[] = [];
  if (parsed.length === 0) warnings.push("Found the header row but no rows with a name and hourly rate filled in.");
  return { rows: parsed, warnings };
}
