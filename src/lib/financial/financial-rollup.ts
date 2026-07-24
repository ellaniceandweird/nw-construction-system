import { computeActualSpent } from "@/lib/financial/budget-actuals";
import type { Budget, CostTransaction } from "@/types/financial";

export interface FinancialRollupRow {
  budgetId: string;
  projectId: string;
  currentBudget: number;
  actualSpent: number;
  remaining: number;
}

export interface FinancialRollupTotals {
  totalBudget: number;
  totalActualSpent: number;
  totalRemaining: number;
  rows: FinancialRollupRow[];
}

/** Totals Budget vs. real Cost Ledger spend across every property with a budget. */
export function computeFinancialRollup(
  budgets: Budget[],
  transactions: CostTransaction[]
): FinancialRollupTotals {
  const rows: FinancialRollupRow[] = budgets.map((b) => {
    const actualSpent = computeActualSpent(b.projectId, transactions);
    return {
      budgetId: b.id,
      projectId: b.projectId,
      currentBudget: b.currentBudget,
      actualSpent,
      remaining: b.currentBudget - actualSpent,
    };
  });

  return {
    totalBudget: rows.reduce((s, r) => s + r.currentBudget, 0),
    totalActualSpent: rows.reduce((s, r) => s + r.actualSpent, 0),
    totalRemaining: rows.reduce((s, r) => s + r.remaining, 0),
    rows,
  };
}
