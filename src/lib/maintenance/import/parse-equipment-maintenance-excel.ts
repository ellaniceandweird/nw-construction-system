import * as XLSX from "xlsx";

import { findColumn } from "@/lib/estimating/import/shared";

export interface ParsedEquipmentMaintenanceRow {
  propertyName: string;
  location: string;
  systemType: string;
  maintenanceNeeded?: string;
  frequency?: string;
  lastCompleted?: string;
  notes?: string;
}

export interface ParsedEquipmentMaintenanceFile {
  rows: ParsedEquipmentMaintenanceRow[];
  warnings: string[];
}

function toDateString(cell: unknown): string | undefined {
  if (!cell) return undefined;
  if (cell instanceof Date) return cell.toISOString().slice(0, 10);
  const text = String(cell).trim();
  if (!text) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  return !isNaN(parsed.getTime()) ? parsed.toISOString().slice(0, 10) : undefined;
}

/** Parses a Recurring (Equipment) Maintenance list — header row with columns like Property, Location, System Type, Maintenance Needed, Frequency, Last Completed, Notes (matched flexibly, any order). */
export async function parseEquipmentMaintenanceExcelFile(file: File): Promise<ParsedEquipmentMaintenanceFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

  const headerRowIndex = rows.findIndex((r) => {
    const texts = r.map((c) => (typeof c === "string" ? c.toLowerCase() : ""));
    return texts.some((t) => t.includes("system") || t.includes("location"));
  });

  if (headerRowIndex === -1) {
    return { rows: [], warnings: ["Couldn't find a header row with a System Type or Location column."] };
  }

  const headers = rows[headerRowIndex].map((h) => String(h ?? ""));
  const propertyCol = findColumn(headers, ["property", "propertyname"]);
  const locationCol = findColumn(headers, ["location"]);
  const systemCol = findColumn(headers, ["systemtype", "system", "equipment"]);
  const neededCol = findColumn(headers, ["maintenanceneeded", "maintenance", "needed"]);
  const frequencyCol = findColumn(headers, ["frequency", "cadence"]);
  const lastCompletedCol = findColumn(headers, ["lastcompleted", "lastservice", "lastdone"]);
  const notesCol = findColumn(headers, ["notes", "comments"]);

  const parsed: ParsedEquipmentMaintenanceRow[] = [];
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => c === undefined || c === "")) continue;

    const systemType = systemCol !== -1 ? String(row[systemCol] ?? "").trim() : "";
    const location = locationCol !== -1 ? String(row[locationCol] ?? "").trim() : "";
    if (!systemType && !location) continue;

    parsed.push({
      propertyName: propertyCol !== -1 ? String(row[propertyCol] ?? "").trim() : "",
      location,
      systemType,
      maintenanceNeeded: neededCol !== -1 ? String(row[neededCol] ?? "").trim() || undefined : undefined,
      frequency: frequencyCol !== -1 ? String(row[frequencyCol] ?? "").trim() || undefined : undefined,
      lastCompleted: lastCompletedCol !== -1 ? toDateString(row[lastCompletedCol]) : undefined,
      notes: notesCol !== -1 ? String(row[notesCol] ?? "").trim() || undefined : undefined,
    });
  }

  const warnings: string[] = [];
  if (parsed.length === 0) {
    warnings.push("Found the header row but no rows with a System Type or Location filled in.");
  }

  return { rows: parsed, warnings };
}
