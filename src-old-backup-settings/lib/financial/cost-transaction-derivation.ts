import type { CostTransaction } from "@/types/financial";
import type { PurchaseOrder } from "@/types/procurement";

/**
 * Converts real Purchase Order line items into read-only Cost Ledger
 * rows (sourceModule: "procurement"). These aren't stored separately —
 * they're derived live from Procurement every time the ledger renders,
 * so there's no double data entry and no risk of the ledger drifting
 * out of sync with actual POs.
 */
export function derivePurchaseOrderTransactions(purchaseOrders: PurchaseOrder[]): CostTransaction[] {
  const rows: CostTransaction[] = [];
  for (const po of purchaseOrders) {
    for (const li of po.lineItems) {
      rows.push({
        id: `POTX-${po.id}-${li.description.slice(0, 10).replace(/\s+/g, "")}`,
        createdBy: "system",
        createdDate: po.createdDate,
        lastModifiedBy: "system",
        lastModifiedDate: po.lastModifiedDate,
        revisionNumber: 1,
        module: "Financial",
        status: "active",
        projectId: po.projectId,
        costCode: li.costCode ?? "",
        category: "material",
        description: `${li.description} (${po.poNumber})`,
        vendorId: po.vendorId,
        date: po.orderDate,
        amount: li.extendedPrice,
        referenceNumber: po.poNumber,
        sourceModule: "procurement",
      });
    }
  }
  return rows;
}
