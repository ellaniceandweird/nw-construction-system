import type { CostDatabaseItem } from "@/types/estimating";

/**
 * ILLUSTRATIVE default rates per cost code — realistic Hudson Valley, NY
 * residential construction rates, used to speed up line-item entry.
 * Replace with your own historical cost data as real project costs come
 * in; this isn't pulled from any real pricing source yet.
 */
function item(data: Omit<CostDatabaseItem, "id" | "createdBy" | "createdDate" | "lastModifiedBy" | "lastModifiedDate" | "revisionNumber" | "module" | "status" | "lastUpdated">, id: string): CostDatabaseItem {
  return {
    id,
    createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-07-01T00:00:00.000Z",
    revisionNumber: 1, module: "Estimating", status: "active",
    lastUpdated: "2026-07-01",
    ...data,
  };
}

export const MOCK_COST_DATABASE: CostDatabaseItem[] = [
  item({ costCode: "01030", description: "Temporary Facilities", unit: "LS", laborCost: 0, materialCost: 5000, equipmentCost: 0, subcontractCost: 0, profitPercent: 0 }, "CDB-000001"),
  item({ costCode: "01060", description: "Permits and Fees", unit: "LS", laborCost: 0, materialCost: 750, equipmentCost: 0, subcontractCost: 0, profitPercent: 0 }, "CDB-000002"),
  item({ costCode: "01090", description: "Construction Labor", unit: "weeks", laborCost: 6540, materialCost: 0, equipmentCost: 0, subcontractCost: 0, profitPercent: 0 }, "CDB-000003"),
  item({ costCode: "02010", description: "Demolition", unit: "LS", laborCost: 0, materialCost: 1500, equipmentCost: 0, subcontractCost: 0, profitPercent: 0 }, "CDB-000004"),
  item({ costCode: "032000", description: "Concrete Reinforcing (Rebar)", unit: "pieces", laborCost: 15, materialCost: 21.50, equipmentCost: 5, subcontractCost: 0, profitPercent: 15 }, "CDB-000005"),
  item({ costCode: "033000", description: "Cast-In-Place Concrete", unit: "cy", laborCost: 220, materialCost: 185, equipmentCost: 50, subcontractCost: 0, profitPercent: 15 }, "CDB-000006"),
  item({ costCode: "042000", description: "Unit Masonry", unit: "cy", laborCost: 400, materialCost: 180, equipmentCost: 0, subcontractCost: 0, profitPercent: 12 }, "CDB-000007"),
  item({ costCode: "06010", description: "Rough Carpentry", unit: "LS", laborCost: 0, materialCost: 1500, equipmentCost: 0, subcontractCost: 0, profitPercent: 0 }, "CDB-000008"),
  item({ costCode: "061000", description: "Rough Carpentry (Framing & Decking)", unit: "lf", laborCost: 4, materialCost: 6.50, equipmentCost: 0, subcontractCost: 0, profitPercent: 15 }, "CDB-000009"),
  item({ costCode: "062000", description: "Finish Carpentry (Trim, Fascia & Soffit)", unit: "lf", laborCost: 2, materialCost: 3.10, equipmentCost: 0, subcontractCost: 0, profitPercent: 15 }, "CDB-000010"),
  item({ costCode: "07010", description: "Damproofing and Waterproofing", unit: "SF", laborCost: 0, materialCost: 0.30, equipmentCost: 0, subcontractCost: 0, profitPercent: 0 }, "CDB-000011"),
  item({ costCode: "074600", description: "Siding", unit: "sf", laborCost: 2.50, materialCost: 4.25, equipmentCost: 0.10, subcontractCost: 0, profitPercent: 15 }, "CDB-000012"),
  item({ costCode: "075400", description: "Roofing Membrane & Shingles", unit: "sq", laborCost: 150, materialCost: 380, equipmentCost: 10, subcontractCost: 0, profitPercent: 15 }, "CDB-000013"),
  item({ costCode: "085000", description: "Windows", unit: "each", laborCost: 350, materialCost: 890, equipmentCost: 0, subcontractCost: 0, profitPercent: 15 }, "CDB-000014"),
  item({ costCode: "099000", description: "Painting & Coating", unit: "gallons", laborCost: 40, materialCost: 55, equipmentCost: 0, subcontractCost: 0, profitPercent: 12 }, "CDB-000015"),
  item({ costCode: "321000", description: "Fencing & Site Improvements", unit: "lf", laborCost: 8, materialCost: 12, equipmentCost: 0, subcontractCost: 0, profitPercent: 12 }, "CDB-000016"),
];
