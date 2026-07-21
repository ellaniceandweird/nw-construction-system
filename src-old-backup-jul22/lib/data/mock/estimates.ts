import type { Estimate, EstimateLineItem } from "@/types/estimating";
import { computeLineItemTotal, computeEstimateTotal } from "@/lib/estimating/estimate-calculations";

/**
 * The 25 Cross St estimate (EST-2026-0001) is transcribed directly from
 * the real "27 Cross Exterior Renovations Revised Quantities" budget
 * workbook uploaded for this project — same line items, quantities, unit
 * costs, and 5% contingency / 2% insurance as the source file. The other
 * two estimates below are illustrative (no source workbook exists for
 * them yet), clearly disclosed in-app.
 */
function withTotal(li: Omit<EstimateLineItem, "totalCost">): EstimateLineItem {
  return { ...li, totalCost: computeLineItemTotal(li) };
}

const crossStLineItems: EstimateLineItem[] = [
  withTotal({ costCode: "01000", description: "Architect (Walter Chatham) — hourly", quantity: 10, unit: "HRS", laborCost: 0, materialCost: 2500, equipmentCost: 0, subcontractCost: 0, notes: "Charged hourly" }),
  withTotal({ costCode: "01030", description: "Temporary Facilities — fencing, dumpster fees, etc.", quantity: 1, unit: "LS", laborCost: 0, materialCost: 5000, equipmentCost: 0, subcontractCost: 0 }),
  withTotal({ costCode: "01060", description: "Permits and Fees — HPC, Building Permit, CoO", quantity: 1, unit: "LS", laborCost: 0, materialCost: 750, equipmentCost: 0, subcontractCost: 0 }),
  withTotal({ costCode: "01070", description: "General Office Overhead — printing, misc office costs", quantity: 1, unit: "LS", laborCost: 0, materialCost: 500, equipmentCost: 0, subcontractCost: 0 }),
  withTotal({ costCode: "01090", description: "Construction Labor — 6 wks full crew @ $6,540/wk", quantity: 6, unit: "weeks", laborCost: 39240, materialCost: 0, equipmentCost: 0, subcontractCost: 0, notes: "7 carpenters and laborers" }),
  withTotal({ costCode: "02010", description: "Demolition — removal of all existing siding & windows", quantity: 1, unit: "LS", laborCost: 0, materialCost: 1500, equipmentCost: 0, subcontractCost: 0, notes: "Labor included under Construction Labor" }),
  withTotal({ costCode: "06010", description: "Rough Carpentry — window rough-opening adjustments", quantity: 1, unit: "LS", laborCost: 0, materialCost: 1500, equipmentCost: 0, subcontractCost: 0 }),
  withTotal({ costCode: "06010", description: "Rough Carpentry — exterior deck repairs and replacement", quantity: 1, unit: "LS", laborCost: 0, materialCost: 2500, equipmentCost: 0, subcontractCost: 0 }),
  withTotal({ costCode: "07010", description: "Damproofing and Waterproofing — house wrap", quantity: 1700, unit: "SF", laborCost: 0, materialCost: 510, equipmentCost: 0, subcontractCost: 0 }),
  withTotal({ costCode: "07010", description: "Misc waterproofing materials", quantity: 1, unit: "LS", laborCost: 0, materialCost: 1000, equipmentCost: 0, subcontractCost: 0 }),
  withTotal({ costCode: "07020", description: "Insulation — window insulation & misc as needed", quantity: 1, unit: "LS", laborCost: 0, materialCost: 1000, equipmentCost: 0, subcontractCost: 0 }),
  withTotal({ costCode: "07030", description: "Roofing — standing seam metal roof", quantity: 1, unit: "LS", laborCost: 0, materialCost: 0, equipmentCost: 0, subcontractCost: 30000, notes: "Subcontractor" }),
  withTotal({ costCode: "07040", description: "Siding — board & batten", quantity: 3300, unit: "LF", laborCost: 0, materialCost: 13200, equipmentCost: 0, subcontractCost: 0 }),
  withTotal({ costCode: "07040", description: "Window Trim", quantity: 1, unit: "LS", laborCost: 0, materialCost: 3500, equipmentCost: 0, subcontractCost: 0 }),
  withTotal({ costCode: "07050", description: "Flashing and Sheet Metal — misc flashing", quantity: 1, unit: "LS", laborCost: 0, materialCost: 2500, equipmentCost: 0, subcontractCost: 0 }),
  withTotal({ costCode: "08020", description: "Exterior Doors — new basement door", quantity: 1, unit: "EA", laborCost: 0, materialCost: 2500, equipmentCost: 0, subcontractCost: 0 }),
  withTotal({ costCode: "08020", description: "Exterior Doors — new 1st floor back door", quantity: 1, unit: "LS", laborCost: 0, materialCost: 3000, equipmentCost: 0, subcontractCost: 0 }),
  withTotal({ costCode: "085000", description: "Windows — Marvin Windows", quantity: 35, unit: "EA", laborCost: 0, materialCost: 74375, equipmentCost: 0, subcontractCost: 0 }),
  withTotal({ costCode: "09050", description: "Painting and Coating — exterior fascia, trim and doors", quantity: 1, unit: "LS", laborCost: 0, materialCost: 2500, equipmentCost: 0, subcontractCost: 0 }),
  withTotal({ costCode: "09050", description: "Painting and Coating — exterior deck stain/paint", quantity: 1, unit: "LS", laborCost: 0, materialCost: 2000, equipmentCost: 0, subcontractCost: 0 }),
];

const crossStContingency: Estimate["contingency"] = {
  constructionContingencyPercent: 5,
  insurancePercent: 2,
};

const bulkheadLineItems: EstimateLineItem[] = [
  withTotal({ costCode: "032000", description: "Rebar, #4 grade 60 — bulkhead reinforcement", quantity: 40, unit: "pieces", laborCost: 600, materialCost: 860, equipmentCost: 200, subcontractCost: 0, markupPercent: 15 }),
  withTotal({ costCode: "033000", description: "Cast-in-place concrete — bulkhead pour", quantity: 8, unit: "cy", laborCost: 1760, materialCost: 1480, equipmentCost: 400, subcontractCost: 0, markupPercent: 15 }),
];
const bulkheadIndirect: Estimate["indirectCosts"] = { generalConditions: 600, permits: 250 };
const bulkheadContingency: Estimate["contingency"] = {
  constructionContingencyPercent: 8,
  corporateOverheadPercent: 5,
  profitPercent: 10,
  salesTaxPercent: 8,
  insurancePercent: 2,
};

const garageRoofLineItems: EstimateLineItem[] = [
  withTotal({ costCode: "075400", description: "Roofing shingles & underlayment — full re-roof", quantity: 11, unit: "sq", laborCost: 1650, materialCost: 4180, equipmentCost: 100, subcontractCost: 0, markupPercent: 15 }),
];
const garageRoofIndirect: Estimate["indirectCosts"] = { permits: 150 };
const garageRoofContingency: Estimate["contingency"] = {
  constructionContingencyPercent: 5,
  corporateOverheadPercent: 5,
  profitPercent: 10,
  salesTaxPercent: 8,
};

export const MOCK_ESTIMATES: Estimate[] = [
  {
    id: "EST-000001",
    createdBy: "system", createdDate: "2026-06-18T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-07-02T00:00:00.000Z",
    revisionNumber: 2, module: "Estimating", status: "active",
    projectId: "PRJ-000006",
    estimateNumber: "EST-2026-0001",
    client: "Kitty",
    address: "25 Cross Street, Hudson NY 12534",
    estimator: "Ella Esquivel",
    estimateDate: "2026-06-18",
    revision: 2,
    estimateStatus: "approved",
    currency: "USD",
    taxMethod: "Sales tax on materials",
    lineItems: crossStLineItems,
    contingency: crossStContingency,
    totalEstimatedCost: computeEstimateTotal(crossStLineItems, undefined, crossStContingency),
    notes: "Transcribed from the 27 Cross Exterior Renovations Revised Quantities budget workbook.",
  },
  {
    id: "EST-000002",
    createdBy: "system", createdDate: "2026-07-01T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-07-10T00:00:00.000Z",
    revisionNumber: 1, module: "Estimating", status: "active",
    projectId: "PRJ-000010",
    estimateNumber: "EST-2026-0002",
    estimator: "Ella Esquivel",
    estimateDate: "2026-07-01",
    revision: 1,
    estimateStatus: "owner_review",
    currency: "USD",
    taxMethod: "Sales tax on materials",
    lineItems: bulkheadLineItems,
    indirectCosts: bulkheadIndirect,
    contingency: bulkheadContingency,
    totalEstimatedCost: computeEstimateTotal(bulkheadLineItems, bulkheadIndirect, bulkheadContingency),
    notes: "Structural bulkhead reinforcement — higher construction contingency given below-grade unknowns.",
  },
  {
    id: "EST-000003",
    createdBy: "system", createdDate: "2026-07-12T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-07-12T00:00:00.000Z",
    revisionNumber: 1, module: "Estimating", status: "active",
    projectId: "PRJ-000002",
    estimateNumber: "EST-2026-0003",
    estimator: "Ella Esquivel",
    estimateDate: "2026-07-12",
    revision: 1,
    estimateStatus: "draft",
    currency: "USD",
    lineItems: garageRoofLineItems,
    indirectCosts: garageRoofIndirect,
    contingency: garageRoofContingency,
    totalEstimatedCost: computeEstimateTotal(garageRoofLineItems, garageRoofIndirect, garageRoofContingency),
    notes: "Draft — pending final shingle color selection before client review.",
  },
];
