import * as XLSX from "xlsx";
import { findColumn } from "@/lib/estimating/import/shared";

export interface ParsedHolidayRow { name: string; date: string; }
export interface ParsedHolidaysFile { rows: ParsedHolidayRow[]; warnings: string[]; }

function toIsoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const parsed = new Date(String(value));
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return "";
}

export async function parseHolidaysExcelFile(file: File): Promise<ParsedHolidaysFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

  const headerRowIndex = rows.findIndex((r) => {
    const texts = r.map((c) => (typeof c === "string" ? c.toLowerCase() : ""));
    return texts.some((t) => t.includes("holiday") || t.includes("name")) && texts.some((t) => t.includes("date"));
  });
  if (headerRowIndex === -1) return { rows: [], warnings: ["Couldn't find a header row with both a Holiday/Name column and a Date column."] };

  const headers = rows[headerRowIndex].map((h) => String(h ?? ""));
  const nameCol = findColumn(headers, ["holidayname", "holiday", "name"]);
  const dateCol = findColumn(headers, ["date"]);

  const parsed: ParsedHolidayRow[] = [];
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => c === undefined || c === "")) continue;
    const name = nameCol !== -1 ? String(row[nameCol] ?? "").trim() : "";
    const date = dateCol !== -1 ? toIsoDate(row[dateCol]) : "";
    if (!name || !date) continue;
    parsed.push({ name, date });
  }

  const warnings: string[] = [];
  if (parsed.length === 0) warnings.push("Found the header row but no rows with both a name and a valid date.");
  return { rows: parsed, warnings };
}
