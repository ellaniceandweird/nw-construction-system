import { computeTotalActual } from "@/lib/estimating/budget-tracking";
import { computeApprovedChangesTotal } from "@/lib/estimating/change-order-store";
import type { Estimate } from "@/types/estimating";
import type { ChangeOrder } from "@/types/change-orders";
import type { PurchaseOrder } from "@/types/procurement";

export interface PortfolioRow {
  estimateId: string;
  projectId: string;
  estimateNumber: string;
  originalEstimate: number;
  approvedChanges: number;
  revisedBudget: number;
  actual: number;
  hasActuals: boolean;
  variance: number;
}

export interface PortfolioTotals {
  totalOriginalEstimated: number;
  totalApprovedChanges: number;
  totalRevisedBudget: number;
  totalActual: number;
  totalVariance: number;
  overallPercentVariance: number;
  rows: PortfolioRow[];
}

/** Aggregates Estimated/Actual/Variance across every property with an estimate — the whole portfolio at a glance. */
export function computePortfolioTotals(
  estimates: Estimate[],
  purchaseOrders: PurchaseOrder[],
  changeOrders: ChangeOrder[]
): PortfolioTotals {
  const rows: PortfolioRow[] = estimates.map((e) => {
    const projectPOs = purchaseOrders.filter((po) => po.projectId === e.projectId);
    const hasActuals = projectPOs.length > 0;
    const actual = computeTotalActual(projectPOs);
    const approvedChanges = computeApprovedChangesTotal(e.id, changeOrders);
    const revisedBudget = e.totalEstimatedCost + approvedChanges;
    return {
      estimateId: e.id,
      projectId: e.projectId,
      estimateNumber: e.estimateNumber,
      originalEstimate: e.totalEstimatedCost,
      approvedChanges,
      revisedBudget,
      actual,
      hasActuals,
      variance: revisedBudget - actual,
    };
  });

  const totalOriginalEstimated = rows.reduce((sum, r) => sum + r.originalEstimate, 0);
  const totalApprovedChanges = rows.reduce((sum, r) => sum + r.approvedChanges, 0);
  const totalRevisedBudget = rows.reduce((sum, r) => sum + r.revisedBudget, 0);
  const totalActual = rows.reduce((sum, r) => sum + r.actual, 0);
  const totalVariance = totalRevisedBudget - totalActual;
  const overallPercentVariance = totalRevisedBudget > 0 ? (totalVariance / totalRevisedBudget) * 100 : 0;

  return { totalOriginalEstimated, totalApprovedChanges, totalRevisedBudget, totalActual, totalVariance, overallPercentVariance, rows };
}
