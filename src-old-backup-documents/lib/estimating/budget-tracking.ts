import { getDivisionSortKey, getDivisionLabel } from "@/lib/estimating/csi-divisions";
import type { EstimateLineItem } from "@/types/estimating";
import type { PurchaseOrder } from "@/types/procurement";

export interface DivisionBudgetRow {
  divisionKey: string;
  divisionLabel: string;
  estimated: number;
  actual: number;
  variance: number;
}

/**
 * Groups an estimate's line items AND a project's real Purchase Orders by
 * CSI division (matched on the shared cost-code convention) so estimated
 * vs. actual can be compared per division, not just per line item — this
 * avoids double-counting when multiple line items share one cost code.
 */
export function computeDivisionBudget(
  lineItems: EstimateLineItem[],
  projectPurchaseOrders: PurchaseOrder[]
): DivisionBudgetRow[] {
  const estimatedByDivision = new Map<string, number>();
  for (const li of lineItems) {
    const key = getDivisionSortKey(li.costCode);
    estimatedByDivision.set(key, (estimatedByDivision.get(key) ?? 0) + li.totalCost);
  }

  const actualByDivision = new Map<string, number>();
  for (const po of projectPurchaseOrders) {
    for (const poLi of po.lineItems) {
      const key = getDivisionSortKey(poLi.costCode);
      actualByDivision.set(key, (actualByDivision.get(key) ?? 0) + poLi.extendedPrice);
    }
  }

  const allKeys = new Set([...estimatedByDivision.keys(), ...actualByDivision.keys()]);
  const rows: DivisionBudgetRow[] = [...allKeys].map((key) => {
    const estimated = estimatedByDivision.get(key) ?? 0;
    const actual = actualByDivision.get(key) ?? 0;
    return { divisionKey: key, divisionLabel: getDivisionLabel(key.padEnd(2, "0")), estimated, actual, variance: estimated - actual };
  });

  return rows.sort((a, b) => a.divisionKey.localeCompare(b.divisionKey));
}

export function computeTotalActual(projectPurchaseOrders: PurchaseOrder[]): number {
  return projectPurchaseOrders.reduce((sum, po) => sum + po.total, 0);
}
