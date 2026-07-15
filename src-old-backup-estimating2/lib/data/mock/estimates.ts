import type { Estimate, EstimateLineItem } from "@/types/estimating";
import { computeLineItemTotal, computeEstimateTotal } from "@/lib/estimating/estimate-calculations";

/**
 * ILLUSTRATIVE estimates — tied to REAL projects and grounded in the same
 * scope as the real Master Schedule activities and the Takeoff items above,
 * but the Estimating module itself has no real cost-database history yet,
 * so unit costs and markups here are realistic placeholders, clearly
 * disclosed in-app. Replace with real historical cost data once available.
 */
function withTotal(li: Omit<EstimateLineItem, "totalCost">): EstimateLineItem {
  return { ...li, totalCost: computeLineItemTotal(li) };
}

const crossStLineItems: EstimateLineItem[] = [
  withTotal({
    costCode: "074600",
    description: "Cedar lap siding — supply & install",
    quantity: 1980,
    unit: "sf",
    laborCost: 4950,
    materialCost: 8415,
    equipmentCost: 150,
    subcontractCost: 0,
    markupPercent: 15,
  }),
  withTotal({
    costCode: "085000",
    description: "Replacement window units — supply & install",
    quantity: 6,
    unit: "each",
    laborCost: 2100,
    materialCost: 5340,
    equipmentCost: 0,
    subcontractCost: 0,
    markupPercent: 15,
  }),
  withTotal({
    costCode: "062000",
    description: "Trim, fascia & soffit boards",
    quantity: 238,
    unit: "lf",
    laborCost: 476,
    materialCost: 737.8,
    equipmentCost: 0,
    subcontractCost: 0,
    markupPercent: 15,
  }),
  withTotal({
    costCode: "099000",
    description: "Exterior paint & stain — siding and trim",
    quantity: 18,
    unit: "gallons",
    laborCost: 720,
    materialCost: 990,
    equipmentCost: 0,
    subcontractCost: 0,
    markupPercent: 12,
  }),
  withTotal({
    costCode: "042000",
    description: "Brick infill, basement level void",
    quantity: 2,
    unit: "cy",
    laborCost: 800,
    materialCost: 360,
    equipmentCost: 0,
    subcontractCost: 0,
    markupPercent: 12,
  }),
  withTotal({
    costCode: "061000",
    description: "Decking boards & stair treads — rear deck repair",
    quantity: 105,
    unit: "lf",
    laborCost: 420,
    materialCost: 682.5,
    equipmentCost: 0,
    subcontractCost: 0,
    markupPercent: 15,
  }),
];

const crossStIndirect: Estimate["indirectCosts"] = {
  generalConditions: 1200,
  permits: 400,
  projectManagement: 1500,
  cleanup: 300,
};

const crossStContingency: Estimate["contingency"] = {
  designContingencyPercent: 3,
  constructionContingencyPercent: 5,
  escalationPercent: 2,
  corporateOverheadPercent: 5,
  profitPercent: 10,
  salesTaxPercent: 8,
  insurancePercent: 2,
};

const bulkheadLineItems: EstimateLineItem[] = [
  withTotal({
    costCode: "032000",
    description: "Rebar, #4 grade 60 — bulkhead reinforcement",
    quantity: 40,
    unit: "pieces",
    laborCost: 600,
    materialCost: 860,
    equipmentCost: 200,
    subcontractCost: 0,
    markupPercent: 15,
  }),
  withTotal({
    costCode: "033000",
    description: "Cast-in-place concrete — bulkhead pour",
    quantity: 8,
    unit: "cy",
    laborCost: 1760,
    materialCost: 1480,
    equipmentCost: 400,
    subcontractCost: 0,
    markupPercent: 15,
  }),
];

const bulkheadIndirect: Estimate["indirectCosts"] = {
  generalConditions: 600,
  permits: 250,
};

const bulkheadContingency: Estimate["contingency"] = {
  constructionContingencyPercent: 8,
  corporateOverheadPercent: 5,
  profitPercent: 10,
  salesTaxPercent: 8,
  insurancePercent: 2,
};

const garageRoofLineItems: EstimateLineItem[] = [
  withTotal({
    costCode: "075400",
    description: "Roofing shingles & underlayment — full re-roof",
    quantity: 11,
    unit: "sq",
    laborCost: 1650,
    materialCost: 4180,
    equipmentCost: 100,
    subcontractCost: 0,
    markupPercent: 15,
  }),
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
    estimator: "Ella Esquivel",
    estimateDate: "2026-06-18",
    revision: 2,
    estimateStatus: "approved",
    currency: "USD",
    taxMethod: "Sales tax on materials",
    lineItems: crossStLineItems,
    indirectCosts: crossStIndirect,
    contingency: crossStContingency,
    totalEstimatedCost: computeEstimateTotal(crossStLineItems, crossStIndirect, crossStContingency),
    notes: "Covers siding, windows, trim, paint, brick infill, and deck repair per the 25 Cross St scope.",
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
    estimateStatus: "client_review",
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
