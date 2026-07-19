import type { ChangeOrder } from "@/types/change-orders";

/**
 * ILLUSTRATIVE change orders — realistic scenarios grounded in the real
 * 25 Cross St and Wick Bulkhead estimates, since no real change order
 * data exists in the source workbook yet.
 */
export const MOCK_CHANGE_ORDERS: ChangeOrder[] = [
  {
    id: "CO-000001",
    createdBy: "system", createdDate: "2026-07-05T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-07-08T00:00:00.000Z",
    revisionNumber: 1, module: "Estimating", status: "active",
    projectId: "PRJ-000006",
    estimateId: "EST-000001",
    changeOrderNumber: "CO-2026-0001",
    description: "Additional sill plate rot found under removed siding — sistered framing repair required",
    reason: "Concealed condition discovered during demolition",
    costImpact: 1450,
    changeOrderStatus: "approved",
    requestedBy: "Ella Esquivel",
    requestedDate: "2026-07-05",
    approvedBy: "Ella Esquivel",
    approvedDate: "2026-07-08",
    notes: "Approved same week — crew was already on site for siding demo.",
  },
  {
    id: "CO-000002",
    createdBy: "system", createdDate: "2026-07-11T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-07-11T00:00:00.000Z",
    revisionNumber: 1, module: "Estimating", status: "active",
    projectId: "PRJ-000010",
    estimateId: "EST-000002",
    changeOrderNumber: "CO-2026-0002",
    description: "Deduct: owner elected to reuse existing bulkhead hardware instead of full replacement",
    reason: "Owner cost-saving request",
    costImpact: -600,
    changeOrderStatus: "pending",
    requestedBy: "Ella Esquivel",
    requestedDate: "2026-07-11",
    notes: "Awaiting confirmation the existing hardware passes inspection.",
  },
];
