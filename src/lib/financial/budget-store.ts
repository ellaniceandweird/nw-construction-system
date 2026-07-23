"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_BUDGETS } from "@/lib/data/mock/budgets";
import { deriveBudgetCategoriesFromEstimate } from "@/lib/financial/budget-derivation";
import type { Budget, BudgetStatus } from "@/types/financial";
import type { Estimate } from "@/types/estimating";

function fromRow(row: Record<string, any>): Budget {
  return {
    id: row.id,
    projectId: row.project_id,
    revision: row.revision ?? 1,
    preparedBy: row.prepared_by,
    approvedBy: row.approved_by ?? undefined,
    approvalDate: row.approval_date ?? undefined,
    budgetStatus: row.budget_status,
    originalBudget: Number(row.original_budget ?? 0),
    currentBudget: Number(row.current_budget ?? 0),
    forecastBudget: Number(row.forecast_budget ?? 0),
    remainingBudget: Number(row.remaining_budget ?? 0),
    categories: row.categories ?? {},
    createdBy: row.created_by ?? "system",
    createdDate: row.created_date ?? new Date().toISOString(),
    lastModifiedBy: row.last_modified_by ?? "system",
    lastModifiedDate: row.last_modified_date ?? new Date().toISOString(),
    revisionNumber: row.revision_number ?? 1,
    module: "Financial",
    status: row.status ?? "active",
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.projectId !== undefined) row.project_id = input.projectId;
  if (input.revision !== undefined) row.revision = input.revision;
  if (input.preparedBy !== undefined) row.prepared_by = input.preparedBy;
  if (input.approvedBy !== undefined) row.approved_by = input.approvedBy;
  if (input.approvalDate !== undefined) row.approval_date = input.approvalDate;
  if (input.budgetStatus !== undefined) row.budget_status = input.budgetStatus;
  if (input.originalBudget !== undefined) row.original_budget = input.originalBudget;
  if (input.currentBudget !== undefined) row.current_budget = input.currentBudget;
  if (input.forecastBudget !== undefined) row.forecast_budget = input.forecastBudget;
  if (input.remainingBudget !== undefined) row.remaining_budget = input.remainingBudget;
  if (input.categories !== undefined) row.categories = input.categories;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<Budget>({
  table: "budgets",
  seedData: MOCK_BUDGETS,
  fromRow,
  toRow,
  orderBy: "created_date",
});

export const subscribeBudgets = store.subscribe;
export const getBudgetsSnapshot = store.getSnapshot;

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, b) => {
    const n = parseInt(b.id.replace("BUD-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `BUD-${String(maxNum + 1).padStart(6, "0")}`;
}

export interface BudgetInput {
  projectId: string;
  preparedBy: string;
  approvedBy?: string;
  approvalDate?: string;
  budgetStatus: BudgetStatus;
  originalBudget: number;
  currentBudget: number;
  forecastBudget: number;
  remainingBudget: number;
  categories: Budget["categories"];
}

export function createBudget(input: BudgetInput) {
  const id = nextId();
  void store.create({ id, revision: 1, ...input });
  return id;
}

export function createBudgetFromEstimate(estimate: Estimate, preparedBy: string) {
  const categories = deriveBudgetCategoriesFromEstimate(estimate);
  return createBudget({
    projectId: estimate.projectId,
    preparedBy,
    budgetStatus: "draft",
    originalBudget: estimate.totalEstimatedCost,
    currentBudget: estimate.totalEstimatedCost,
    forecastBudget: estimate.totalEstimatedCost,
    remainingBudget: estimate.totalEstimatedCost,
    categories,
  });
}

export function updateBudget(id: string, input: BudgetInput) {
  const existing = store.getSnapshot().find((b) => b.id === id);
  void store.update(id, { ...input, revision: (existing?.revision ?? 1) + 1 });
}

export function deleteBudget(id: string) {
  void store.remove(id);
}
