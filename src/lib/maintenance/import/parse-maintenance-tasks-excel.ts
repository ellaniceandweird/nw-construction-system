import * as XLSX from "xlsx";

import { findColumn } from "@/lib/estimating/import/shared";

export interface ParsedMaintenanceTaskRow {
  propertyName: string;
  taskDescription: string;
  priority?: string;
  responsibleParty?: string;
  plannedCompletionDate?: string;
}

export interface ParsedMaintenanceTasksFile {
  rows: ParsedMaintenanceTaskRow[];
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

/** Parses a General Maintenance task list — header row with columns like Property, Task/Description, Priority, Ball In Court / Responsible Party, Target/Planned Completion Date (matched flexibly, any order). */
export async function parseMaintenanceTasksExcelFile(file: File): Promise<ParsedMaintenanceTasksFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

  const headerRowIndex = rows.findIndex((r) => {
    const texts = r.map((c) => (typeof c === "string" ? c.toLowerCase() : ""));
    return texts.some((t) => t.includes("task") || t.includes("description"));
  });

  if (headerRowIndex === -1) {
    return { rows: [], warnings: ["Couldn't find a header row with a Task or Description column."] };
  }

  const headers = rows[headerRowIndex].map((h) => String(h ?? ""));
  const propertyCol = findColumn(headers, ["property", "propertyname"]);
  const taskCol = findColumn(headers, ["taskdescription", "task", "description"]);
  const priorityCol = findColumn(headers, ["priority"]);
  const responsibleCol = findColumn(headers, ["ballincourt", "responsibleparty", "responsible", "assignedto"]);
  const dateCol = findColumn(headers, ["targetcompletiondate", "plannedcompletiondate", "targetdate", "duedate", "date"]);

  const parsed: ParsedMaintenanceTaskRow[] = [];
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => c === undefined || c === "")) continue;

    const taskDescription = taskCol !== -1 ? String(row[taskCol] ?? "").trim() : "";
    if (!taskDescription) continue;

    parsed.push({
      propertyName: propertyCol !== -1 ? String(row[propertyCol] ?? "").trim() : "",
      taskDescription,
      priority: priorityCol !== -1 ? String(row[priorityCol] ?? "").trim() || undefined : undefined,
      responsibleParty: responsibleCol !== -1 ? String(row[responsibleCol] ?? "").trim() || undefined : undefined,
      plannedCompletionDate: dateCol !== -1 ? toDateString(row[dateCol]) : undefined,
    });
  }

  const warnings: string[] = [];
  if (parsed.length === 0) {
    warnings.push("Found the header row but no rows with a Task/Description filled in.");
  }

  return { rows: parsed, warnings };
}
