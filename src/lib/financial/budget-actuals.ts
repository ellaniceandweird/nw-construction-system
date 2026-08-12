import type { CostTransaction } from "@/types/financial";
import type { Budget } from "@/types/financial";

/** Real spend against a project, pulled from the live Cost Ledger (Purchase Orders + manual entries). */
export function computeActualSpent(projectId: string, transactions: CostTransaction[]): number {
  return transactions.filter((t) => t.projectId === projectId).reduce((sum, t) => sum + t.amount, 0);
}

/** What's left in a budget, computed live rather than trusting a static stored number. */
export function computeRemainingBudget(budget: Budget, transactions: CostTransaction[]): number {
  return budget.currentBudget - computeActualSpent(budget.projectId, transactions);
}
