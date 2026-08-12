import type { CostTransaction } from "@/types/financial";

/**
 * ILLUSTRATIVE manually-entered cost transactions — costs that don't run
 * through a Purchase Order (permit fees paid directly, petty cash, etc).
 * Purchase-order-based costs are NOT duplicated here; they're derived
 * live from Procurement (see cost-transaction-derivation.ts).
 */
export const MOCK_COST_TRANSACTIONS: CostTransaction[] = [
  {
    id: "CTX-000001",
    createdBy: "system", createdDate: "2026-06-23T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-06-23T00:00:00.000Z",
    revisionNumber: 1, module: "Financial", status: "active",
    projectId: "PRJ-000006",
    costCode: "01060",
    category: "miscellaneous",
    description: "HPC (Historic Preservation Commission) filing fee, paid directly at town hall",
    date: "2026-06-23",
    amount: 350,
    referenceNumber: "Receipt #4471",
    sourceModule: "manual",
  },
];
