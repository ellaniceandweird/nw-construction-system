import * as XLSX from "xlsx";

import { findColumn } from "@/lib/estimating/import/shared";
import { getTodayInNewYorkString } from "@/lib/date/today";

export interface ParsedLogRow {
  /** yyyy-mm-dd — the day the work was actually done. */
  date: string;
  propertyName: string;
  description: string;
  staffName?: string;
  notes?: string;
}

export interface ParsedLogFile {
  rows: ParsedLogRow[];
  warnings: string[];
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Built from local date parts (not toISOString) so a date typed as "9/8/2026" can never slip to the day before just because of timezone conversion. */
function toYmd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseLooseDate(cell: unknown): string | undefined {
  if (cell == null || cell === "") return undefined;
  if (cell instanceof Date) return isNaN(cell.getTime()) ? undefined : toYmd(cell);
  const text = String(cell).trim();
  if (!text) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  return isNaN(parsed.getTime()) ? undefined : toYmd(parsed);
}

/**
 * Parses a staff completion report — one row per piece of work done.
 * Headers are matched flexibly and in any order: Date, Property,
 * Work Done / Description / Task, Completed By / Staff, Notes.
 */
export async function parseMaintenanceLogExcelFile(file: File): Promise<ParsedLogFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

  const headerRowIndex = rows.findIndex((r) => {
    const texts = r.map((c) => (typeof c === "string" ? c.toLowerCase() : ""));
    return texts.some((t) => t.includes("work") || t.includes("task") || t.includes("description") || t.includes("activity"));
  });
  if (headerRowIndex === -1) {
    return { rows: [], warnings: ["Couldn't find a header row with a Work Done, Task, or Description column."] };
  }

  const headers = rows[headerRowIndex].map((h) => String(h ?? ""));
  const dateCol = findColumn(headers, ["datecompleted", "completeddate", "dateperformed", "date"]);
  const propertyCol = findColumn(headers, ["property", "location", "building"]);
  const workCol = findColumn(headers, ["workdone", "workperformed", "taskdescription", "description", "activity", "task", "work"]);
  const staffCol = findColumn(headers, ["completedby", "performedby", "staff", "employee", "technician", "worker", "doneby", "by"]);
  const notesCol = findColumn(headers, ["notes", "comments", "remarks", "detail"]);

  const parsed: ParsedLogRow[] = [];
  let missingDates = 0;
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => c === undefined || c === "")) continue;
    const description = workCol !== -1 ? String(row[workCol] ?? "").trim() : "";
    if (!description) continue;

    const date = dateCol !== -1 ? parseLooseDate(row[dateCol]) : undefined;
    if (!date) missingDates++;

    parsed.push({
      date: date ?? getTodayInNewYorkString(),
      propertyName: propertyCol !== -1 ? String(row[propertyCol] ?? "").trim() : "",
      description,
      staffName: staffCol !== -1 ? String(row[staffCol] ?? "").trim() || undefined : undefined,
      notes: notesCol !== -1 ? String(row[notesCol] ?? "").trim() || undefined : undefined,
    });
  }

  const warnings: string[] = [];
  if (parsed.length === 0) warnings.push("Found the header row but no rows with the work done filled in.");
  if (missingDates > 0) {
    warnings.push(`${missingDates} row(s) had no readable date and were set to today — check the Date column below before saving.`);
  }
  return { rows: parsed, warnings };
}

async function extractPdfLines(file: File): Promise<string[]> {
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
    for (const y of sortedYs) lines.push(byY.get(y)!.join(" ").trim());
  }
  return lines.filter((l) => l.length > 0);
}

const LEADING_DATE = /^(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}|[A-Za-z]{3,9}\.? \d{1,2},? \d{4})\s*[-:–]?\s*/;

/**
 * Best-effort PDF parsing: PDFs don't keep table columns, so each line
 * becomes one row, with a leading date (if the line starts with one)
 * split off. Property and staff name need a manual fill-in on review.
 */
export async function parseMaintenanceLogPdfFile(file: File): Promise<ParsedLogFile> {
  const lines = await extractPdfLines(file);
  const rows: ParsedLogRow[] = [];
  for (const line of lines) {
    if (line.length < 6 || line.length > 300 || /^(page \d+|date\b|property\b)/i.test(line)) continue;
    const match = line.match(LEADING_DATE);
    const date = match ? parseLooseDate(match[1]) : undefined;
    const description = (match ? line.slice(match[0].length) : line).trim();
    if (!description) continue;
    rows.push({ date: date ?? getTodayInNewYorkString(), propertyName: "", description });
  }
  return {
    rows,
    warnings: [
      "PDF reading is best-effort — each line was taken as one piece of work, with a date picked up where the line started with one. Fill in the property and who did the work below before saving.",
    ],
  };
}
