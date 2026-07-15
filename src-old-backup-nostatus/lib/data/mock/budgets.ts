import type { Budget } from "@/types/financial";
import { MOCK_ESTIMATES } from "@/lib/data/mock/estimates";
import { deriveBudgetCategoriesFromEstimate } from "@/lib/financial/budget-derivation";

/**
 * ILLUSTRATIVE budgets — derived from the real 25 Cross St estimate using
 * deriveBudgetCategoriesFromEstimate(), since no separate real budget
 * data exists yet. currentBudget includes the approved CO-2026-0001
 * change order (+$1,450) already reflected in Estimating's Cost Tracking.
 */
const crossStEstimate = MOCK_ESTIMATES.find((e) => e.estimateNumber === "EST-2026-0001")!;
const crossStCategories = deriveBudgetCategoriesFromEstimate(crossStEstimate);

export const MOCK_BUDGETS: Budget[] = [
  {
    id: "BUD-000001",
    createdBy: "system", createdDate: "2026-06-20T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-07-08T00:00:00.000Z",
    revisionNumber: 2, module: "Financial", status: "active",
    projectId: crossStEstimate.projectId,
    revision: 2,
    preparedBy: "Ella Esquivel",
    approvedBy: "Ella Esquivel",
    approvalDate: "2026-06-22",
    budgetStatus: "approved",
    originalBudget: crossStEstimate.totalEstimatedCost,
    currentBudget: crossStEstimate.totalEstimatedCost + 1450,
    forecastBudget: crossStEstimate.totalEstimatedCost + 1450,
    remainingBudget: crossStEstimate.totalEstimatedCost + 1450,
    categories: crossStCategories,
  },
];
