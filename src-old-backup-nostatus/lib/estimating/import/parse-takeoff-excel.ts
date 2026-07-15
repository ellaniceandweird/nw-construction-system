import * as XLSX from "xlsx";

import { findColumn, parseNumber } from "@/lib/estimating/import/shared";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";

export interface ParsedTakeoffRow {
  projectId: string;
  projectNameGuess: string;
  description: string;
  location?: string;
  costCode?: string;
  quantity: number;
  unit: string;
  wasteFactorPercent?: number;
}

export interface ParsedTakeoffFile {
  rows: ParsedTakeoffRow[];
  hasProjectColumn: boolean;
  warnings: string[];
}

function matchProjectId(nameGuess: string): string {
  if (!nameGuess) return "";
  const normalized = nameGuess.toLowerCase();
  const match = MOCK_PROJECTS.find(
    (p) => normalized.includes(p.projectName.toLowerCase()) || p.projectName.toLowerCase().includes(normalized)
  );
  return match?.id ?? "";
}

/**
 * Parses a quantity takeoff spreadsheet: header row with columns like
 * Project (optional), Task/Description, Cost Code, Quantity, Unit,
 * Location, Waste %. If there's no Project column, every parsed row is
 * left without a project — the review step lets you pick one project to
 * apply to the whole batch.
 */
export async function parseTakeoffExcelFile(file: File): Promise<ParsedTakeoffFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

  const headerRowIndex = rows.findIndex((r) => {
    const texts = r.map((c) => (typeof c === "string" ? c.toLowerCase() : ""));
    return (
      (texts.some((t) => t.includes("task")) || texts.some((t) => t.includes("description"))) &&
      texts.some((t) => t.includes("quantity") || t.includes("qty"))
    );
  });

  if (headerRowIndex === -1) {
    return { rows: [], hasProjectColumn: false, warnings: ["Couldn't find a header row with a Task/Description and Quantity column."] };
  }

  const headers = rows[headerRowIndex].map((h) => String(h ?? ""));
  const projectCol = findColumn(headers, ["project", "property"]);
  const taskCol = findColumn(headers, ["task", "tasks"]);
  const descriptionCol = findColumn(headers, ["description"]);
  const costCodeCol = findColumn(headers, ["costcode", "code"]);
  const quantityCol = findColumn(headers, ["quantity", "qty"]);
  const unitCol = findColumn(headers, ["unit"]);
  const locationCol = findColumn(headers, ["location"]);
  const wasteCol = findColumn(headers, ["waste"]);

  const parsedRows: ParsedTakeoffRow[] = [];
  let lastCostCode = "";
  let lastTask = "";

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => c === undefined || c === "")) continue;

    const taskRaw = taskCol !== -1 ? String(row[taskCol] ?? "").trim() : "";
    const descriptionRaw = descriptionCol !== -1 ? String(row[descriptionCol] ?? "").trim() : "";
    const quantity = quantityCol !== -1 ? parseNumber(row[quantityCol]) : null;
    if (taskRaw) lastTask = taskRaw;
    const costCodeRaw = costCodeCol !== -1 ? String(row[costCodeCol] ?? "").trim() : "";
    if (costCodeRaw) lastCostCode = costCodeRaw;

    if (quantity == null) continue; // skip section headers / NIC rows with no quantity

    const description =
      descriptionRaw && taskRaw && descriptionRaw !== taskRaw
        ? `${taskRaw} — ${descriptionRaw}`
        : descriptionRaw || taskRaw || lastTask || "Untitled item";

    const projectNameGuess = projectCol !== -1 ? String(row[projectCol] ?? "").trim() : "";

    parsedRows.push({
      projectId: matchProjectId(projectNameGuess),
      projectNameGuess,
      description,
      location: locationCol !== -1 ? String(row[locationCol] ?? "").trim() || undefined : undefined,
      costCode: costCodeRaw || lastCostCode || undefined,
      quantity,
      unit: unitCol !== -1 ? String(row[unitCol] ?? "each").trim() || "each" : "each",
      wasteFactorPercent: wasteCol !== -1 ? parseNumber(row[wasteCol]) ?? undefined : undefined,
    });
  }

  const warnings: string[] = [];
  if (parsedRows.length === 0) {
    warnings.push("Found the header row but no rows with a quantity — double-check the sheet.");
  }

  return { rows: parsedRows, hasProjectColumn: projectCol !== -1, warnings };
}
