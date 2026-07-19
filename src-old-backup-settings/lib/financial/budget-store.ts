"use client";
import { MOCK_BUDGETS } from "@/lib/data/mock/budgets";
import { deriveBudgetCategoriesFromEstimate } from "@/lib/financial/budget-derivation";
import type { Budget, BudgetStatus } from "@/types/financial";
import type { Estimate } from "@/types/estimating";

const STORAGE_KEY = "project-nw:budgets";
type Listener = () => void;
let budgets: Budget[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): Budget[] {
  if (typeof window === "undefined") return MOCK_BUDGETS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return MOCK_BUDGETS;
    return JSON.parse(raw) as Budget[];
  } catch {
    return MOCK_BUDGETS;
  }
}
function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
}
function emit() {
  listeners.forEach((l) => l());
}
function nextId(): string {
  const maxNum = budgets.reduce((max, b) => {
    const n = parseInt(b.id.replace("BUD-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `BUD-${String(maxNum + 1).padStart(6, "0")}`;
}

export function subscribeBudgets(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function getBudgetsSnapshot(): Budget[] {
  return budgets;
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
  const now = new Date().toISOString();
  const newBudget: Budget = {
    id: nextId(),
    createdBy: "user", createdDate: now,
    lastModifiedBy: "user", lastModifiedDate: now,
    revisionNumber: 1, module: "Financial", status: "active",
    revision: 1,
    ...input,
  };
  budgets = [...budgets, newBudget];
  persist();
  emit();
  return newBudget;
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
  budgets = budgets.map((b) =>
    b.id === id ? { ...b, ...input, revision: b.revision + 1, revisionNumber: b.revisionNumber + 1, lastModifiedDate: new Date().toISOString() } : b
  );
  persist();
  emit();
}
export function deleteBudget(id: string) {
  budgets = budgets.filter((b) => b.id !== id);
  persist();
  emit();
}
