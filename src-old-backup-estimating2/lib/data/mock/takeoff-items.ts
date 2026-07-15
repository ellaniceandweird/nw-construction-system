import type { TakeoffItem } from "@/types/estimating";

/**
 * ILLUSTRATIVE quantity takeoffs — the Estimating module's real counterpart
 * didn't exist before this build, so there's no real takeoff data to pull
 * from your source workbook. These are tied to REAL projects and REAL
 * schedule activities (e.g. "Fill Brick Void", "Bulkhead Construction",
 * "New Roof" in the Master Schedule), so the numbers are at least grounded
 * in real scope even though the quantities themselves are illustrative.
 *
 * The materialKey on each item bridges to Procurement's Forecast tab
 * (lib/forecast/material-detector.ts uses the same keys), so a takeoff
 * entered here shows up as the quantity source on that tab automatically.
 */
function adjusted(quantity: number, wasteFactorPercent?: number) {
  return wasteFactorPercent ? Math.round(quantity * (1 + wasteFactorPercent / 100)) : quantity;
}

function item(data: Omit<TakeoffItem, "adjustedQuantity">): TakeoffItem {
  return { ...data, adjustedQuantity: adjusted(data.quantity, data.wasteFactorPercent) };
}

export const MOCK_TAKEOFF_ITEMS: TakeoffItem[] = [
  item({
    id: "TO-000001",
    projectId: "PRJ-000006",
    description: "Cedar lap siding, 25 Cross St exterior renovation",
    location: "North & west elevations",
    costCode: "074600",
    csiDivision: "Division 07",
    measurementType: "sf",
    unit: "sf",
    quantity: 1800,
    wasteFactorPercent: 10,
    measuredBy: "Ella Esquivel",
    materialKey: "cedar-siding",
  }),
  item({
    id: "TO-000002",
    projectId: "PRJ-000006",
    description: "Replacement window units, matching existing openings",
    location: "North elevation",
    costCode: "085000",
    csiDivision: "Division 08",
    measurementType: "each",
    unit: "each",
    quantity: 6,
    measuredBy: "Ella Esquivel",
    materialKey: "windows",
  }),
  item({
    id: "TO-000003",
    projectId: "PRJ-000006",
    description: "Trim, fascia & soffit boards to match existing profile",
    costCode: "062000",
    csiDivision: "Division 06",
    measurementType: "lf",
    unit: "lf",
    quantity: 220,
    wasteFactorPercent: 8,
    measuredBy: "Ella Esquivel",
    materialKey: "trim-fascia",
  }),
  item({
    id: "TO-000004",
    projectId: "PRJ-000006",
    description: "Exterior paint & stain, siding and trim",
    costCode: "099000",
    csiDivision: "Division 09",
    measurementType: "gallons",
    unit: "gallons",
    quantity: 18,
    measuredBy: "Ella Esquivel",
    materialKey: "paint-stain",
  }),
  item({
    id: "TO-000005",
    projectId: "PRJ-000006",
    description: "Brick infill, basement level void",
    location: "Basement",
    costCode: "042000",
    csiDivision: "Division 04",
    measurementType: "cy",
    unit: "cy",
    quantity: 2,
    measuredBy: "Ella Esquivel",
    materialKey: "masonry",
  }),
  item({
    id: "TO-000006",
    projectId: "PRJ-000006",
    description: "Decking boards & stair treads, rear deck repair",
    costCode: "061000",
    csiDivision: "Division 06",
    measurementType: "lf",
    unit: "lf",
    quantity: 100,
    wasteFactorPercent: 5,
    measuredBy: "Ella Esquivel",
    materialKey: "decking-lumber",
  }),
  item({
    id: "TO-000007",
    projectId: "PRJ-000010",
    description: "Rebar, #4 grade 60, bulkhead reinforcement",
    location: "Bulkhead",
    costCode: "032000",
    csiDivision: "Division 03",
    measurementType: "pieces",
    unit: "pieces",
    quantity: 40,
    measuredBy: "Ella Esquivel",
    materialKey: "rebar-concrete",
  }),
  item({
    id: "TO-000008",
    projectId: "PRJ-000002",
    description: "Roofing shingles & underlayment, full re-roof",
    costCode: "075400",
    csiDivision: "Division 07",
    measurementType: "sq",
    unit: "sq",
    quantity: 10,
    wasteFactorPercent: 10,
    measuredBy: "Ella Esquivel",
    materialKey: "roofing",
  }),
  item({
    id: "TO-000009",
    projectId: "PRJ-000014",
    description: "Fence panels & garden gate hardware, by kitchen",
    costCode: "321000",
    csiDivision: "Division 32",
    measurementType: "lf",
    unit: "lf",
    quantity: 40,
    measuredBy: "Ella Esquivel",
    materialKey: "fencing",
  }),
  item({
    id: "TO-000010",
    projectId: "PRJ-000015",
    description: "Roof repair patch — shingles & flashing",
    costCode: "075400",
    csiDivision: "Division 07",
    measurementType: "sq",
    unit: "sq",
    quantity: 14,
    wasteFactorPercent: 10,
    measuredBy: "Ella Esquivel",
    materialKey: "roofing",
  }),
];
