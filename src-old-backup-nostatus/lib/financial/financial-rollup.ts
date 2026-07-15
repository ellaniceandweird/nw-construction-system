import { computeActualSpent } from "@/lib/financial/budget-actuals";
import type { Budget, CostTransaction, Invoice } from "@/types/financial";

export interface FinancialRollupRow {
  budgetId: string;
  projectId: string;
  currentBudget: number;
  actualSpent: number;
  remaining: number;
  outstandingInvoices: number;
}

export interface FinancialRollupTotals {
  totalBudget: number;
  totalActualSpent: number;
  totalRemaining: number;
  totalOutstandingInvoices: number;
  rows: FinancialRollupRow[];
}

/** Totals Budget vs. real Cost Ledger spend vs. outstanding invoices across every property with a budget. */
export function computeFinancialRollup(
  budgets: Budget[],
  transactions: CostTransaction[],
  invoices: Invoice[]
): FinancialRollupTotals {
  const rows: FinancialRollupRow[] = budgets.map((b) => {
    const actualSpent = computeActualSpent(b.projectId, transactions);
    const outstandingInvoices = invoices
      .filter((i) => i.projectId === b.projectId && i.invoiceStatus !== "paid" && i.invoiceStatus !== "cancelled")
      .reduce((sum, i) => sum + i.totalAmount, 0);
    return {
      budgetId: b.id,
      projectId: b.projectId,
      currentBudget: b.currentBudget,
      actualSpent,
      remaining: b.currentBudget - actualSpent,
      outstandingInvoices,
    };
  });

  return {
    totalBudget: rows.reduce((s, r) => s + r.currentBudget, 0),
    totalActualSpent: rows.reduce((s, r) => s + r.actualSpent, 0),
    totalRemaining: rows.reduce((s, r) => s + r.remaining, 0),
    totalOutstandingInvoices: rows.reduce((s, r) => s + r.outstandingInvoices, 0),
    rows,
  };
}
