import * as XLSX from "xlsx";

import { findColumn, parseNumber } from "@/lib/estimating/import/shared";
import type { ParsedEstimateFile } from "@/lib/estimating/import/shared";
import type { EstimateLineItem } from "@/types/estimating";

/**
 * Parses a budget/estimate workbook like the "27 Cross Exterior
 * Renovations Revised Quantities" format: a title/address block, a
 * header row (ITEM #, TASKS, Description, COST CODE, QUANTITY, UNIT,
 * UNIT COST, TOTAL, ...), section-header rows with no cost data (division
 * names), "NIC" (Not In Contract) rows, and a Subtotal/Contingency/
 * Insurance/Total footer. Only rows with a real quantity + unit cost
 * become line items — everything else is skipped or (for the
 * contingency/insurance footer) captured as percentages.
 */
const SKIP_KEYWORDS = /^(subtotal|total|nic)\b/i;
const CONTINGENCY_KEYWORD = /contingency/i;
const INSURANCE_KEYWORD = /insurance/i;
const TAX_KEYWORD = /sales\s*tax|tax\b/i;
const PERCENT_PATTERN = /(\d+(?:\.\d+)?)\s*%/;
const SUBCONTRACTOR_KEYWORD = /subcontractor/i;

export async function parseEstimateExcelFile(file: File): Promise<ParsedEstimateFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

  const warnings: string[] = [];

  const headerRowIndex = rows.findIndex((r) => {
    const texts = r.map((c) => (typeof c === "string" ? c.toLowerCase() : ""));
    return texts.some((t) => t.includes("task")) && texts.some((t) => t.includes("quantity") || t.includes("qty"));
  });

  if (headerRowIndex === -1) {
    return {
      projectNameGuess: "",
      addressGuess: "",
      lineItems: [],
      contingency: {},
      warnings: ["Couldn't find a header row (looking for columns like TASKS and QUANTITY) — is this the right sheet?"],
    };
  }

  // Guess project name / address from the non-empty rows above the header.
  const preHeaderText = rows
    .slice(0, headerRowIndex)
    .map((r) => r.find((c) => typeof c === "string" && c.trim().length > 0))
    .filter((v): v is string => !!v);
  const projectNameGuess = preHeaderText[0]?.trim() ?? "";
  const addressGuess = preHeaderText[1]?.trim() ?? "";

  const headers = rows[headerRowIndex].map((h) => String(h ?? ""));
  const taskCol = findColumn(headers, ["tasks", "task"]);
  const descriptionCol = findColumn(headers, ["description"]);
  const costCodeCol = findColumn(headers, ["costcode", "code"]);
  const quantityCol = findColumn(headers, ["quantity", "qty"]);
  const unitCol = findColumn(headers, ["unit"]);
  const unitCostCol = findColumn(headers, ["unitcost", "unitprice", "rate"]);
  const notesCol = findColumn(headers, ["notes", "note"]);

  const lineItems: Omit<EstimateLineItem, "totalCost">[] = [];
  const contingency: ParsedEstimateFile["contingency"] = {};

  let lastTask = "";
  let lastCostCode = "";

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => c === undefined || c === "")) continue;

    const taskRaw = taskCol !== -1 ? String(row[taskCol] ?? "").trim() : "";
    const descriptionRaw = descriptionCol !== -1 ? String(row[descriptionCol] ?? "").trim() : "";
    const notesRaw = notesCol !== -1 ? String(row[notesCol] ?? "").trim() : "";

    // Footer rows: Subtotal / Contingency % / Insurance % / Sales Tax % / Total
    if (CONTINGENCY_KEYWORD.test(taskRaw)) {
      const m = taskRaw.match(PERCENT_PATTERN);
      if (m) contingency.constructionContingencyPercent = parseFloat(m[1]);
      continue;
    }
    if (INSURANCE_KEYWORD.test(taskRaw)) {
      const m = taskRaw.match(PERCENT_PATTERN);
      if (m) contingency.insurancePercent = parseFloat(m[1]);
      continue;
    }
    if (TAX_KEYWORD.test(taskRaw)) {
      const m = taskRaw.match(PERCENT_PATTERN);
      if (m) contingency.salesTaxPercent = parseFloat(m[1]);
      continue;
    }
    if (SKIP_KEYWORDS.test(taskRaw)) continue;

    const quantity = quantityCol !== -1 ? parseNumber(row[quantityCol]) : null;
    const unitCost = unitCostCol !== -1 ? parseNumber(row[unitCostCol]) : null;

    if (taskRaw) lastTask = taskRaw;
    const costCodeRaw = costCodeCol !== -1 ? String(row[costCodeCol] ?? "").trim() : "";
    if (costCodeRaw) lastCostCode = costCodeRaw;

    // No quantity/unit cost => a division header or an "NIC" (not-in-contract) row, not a real cost line.
    if (quantity == null || unitCost == null) continue;

    const description =
      descriptionRaw && taskRaw && descriptionRaw !== taskRaw
        ? `${taskRaw} — ${descriptionRaw}`
        : descriptionRaw || taskRaw || lastTask || "Untitled item";
    const unit = unitCol !== -1 ? String(row[unitCol] ?? "each").trim() || "each" : "each";
    const total = quantity * unitCost;
    const isSubcontracted = SUBCONTRACTOR_KEYWORD.test(notesRaw);

    lineItems.push({
      costCode: costCodeRaw || lastCostCode || "",
      description,
      quantity,
      unit,
      laborCost: 0,
      materialCost: isSubcontracted ? 0 : total,
      equipmentCost: 0,
      subcontractCost: isSubcontracted ? total : 0,
      markupPercent: 0,
      notes: notesRaw || undefined,
    } as Omit<EstimateLineItem, "totalCost">);
  }

  if (lineItems.length === 0) {
    warnings.push("Found the header row but no line items with both a quantity and a unit cost — double-check the sheet.");
  }

  return { projectNameGuess, addressGuess, lineItems, contingency, warnings };
}
