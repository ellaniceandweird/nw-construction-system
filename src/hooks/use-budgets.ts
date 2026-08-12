"use client";
import { useSyncExternalStore } from "react";
import { subscribeBudgets, getBudgetsSnapshot } from "@/lib/financial/budget-store";
import { MOCK_BUDGETS } from "@/lib/data/mock/budgets";
export function useBudgets() {
  return useSyncExternalStore(subscribeBudgets, getBudgetsSnapshot, () => MOCK_BUDGETS);
}
