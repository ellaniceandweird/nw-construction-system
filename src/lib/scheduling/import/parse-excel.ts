import * as XLSX from "xlsx";

import { matchProjectName, parseDateFlexible } from "@/lib/scheduling/import/shared";
import type { ParsedActivityRow } from "@/lib/scheduling/import/shared";
import type { Project } from "@/types/project";

function normalizeHeader(h: string) {
  return h.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findColumn(headers: string[], candidates: string[]): number {
  const normalized = headers.map(normalizeHeader);
  for (const candidate of candidates) {
    const idx = normalized.findIndex((h) => h.includes(candidate));
    if (idx !== -1) return idx;
  }
  return -1;
}

/**
 * Parses an uploaded .xlsx/.xls/.csv file into staged rows for review.
 * Column headers are matched flexibly (case/spacing/punctuation-insensitive)
 * against common names, so "Start Date", "Planned Start", and "start" all
 * work the same way.
 */
export async function parseExcelFile(file: File, projects: Project[]): Promise<ParsedActivityRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

  // Find the header row: the first row with at least 3 non-empty cells
  const headerRowIndex = rows.findIndex(
    (r) => r.filter((c) => c !== undefined && c !== "").length >= 3
  );
  if (headerRowIndex === -1) return [];

  const headers = rows[headerRowIndex].map((h) => String(h ?? ""));
  const projectCol = findColumn(headers, ["project", "property"]);
  const activityCol = findColumn(headers, ["activity", "task", "description"]);
  const startCol = findColumn(headers, ["plannedstart", "startdate", "start"]);
  const finishCol = findColumn(headers, ["plannedfinish", "finishdate", "enddate", "finish", "end"]);
  const manpowerCol = findColumn(headers, ["manpower", "crew", "workers"]);
  const statusCol = findColumn(headers, ["status"]);

  const results: ParsedActivityRow[] = [];

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => c === undefined || c === "")) continue;

    const activityName = activityCol !== -1 ? String(row[activityCol] ?? "").trim() : "";
    if (!activityName) continue; // skip rows with no task name at all

    const projectNameRaw = projectCol !== -1 ? String(row[projectCol] ?? "").trim() : "";
    const plannedStart = startCol !== -1 ? parseDateFlexible(row[startCol]) : "";
    const plannedFinish = finishCol !== -1 ? parseDateFlexible(row[finishCol]) : "";
    const manpowerRaw = manpowerCol !== -1 ? row[manpowerCol] : undefined;
    const requiredManpower =
      typeof manpowerRaw === "number"
        ? manpowerRaw
        : parseInt(String(manpowerRaw ?? ""), 10) || undefined;
    const statusRaw = statusCol !== -1 ? String(row[statusCol] ?? "").toLowerCase() : "";

    const warnings: string[] = [];
    const matchedProjectId = matchProjectName(projectNameRaw, projects);
    if (!matchedProjectId) warnings.push("Couldn't match a project — please select one");
    if (!plannedStart) warnings.push("Start date couldn't be read");
    if (!plannedFinish) warnings.push("Finish date couldn't be read");

    results.push({
      rowId: `import-${i}`,
      projectNameRaw,
      matchedProjectId,
      activityName,
      plannedStart,
      plannedFinish,
      requiredManpower,
      status: statusRaw.includes("complet")
        ? "completed"
        : statusRaw.includes("progress")
        ? "in_progress"
        : statusRaw.includes("delay")
        ? "delayed"
        : "not_started",
      include: warnings.length === 0,
      warnings,
    });
  }

  return results;
}
