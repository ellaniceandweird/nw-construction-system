"use client";
import { useSyncExternalStore } from "react";
import { subscribeCostCodes, getCostCodesSnapshot } from "@/lib/estimating/cost-code-store";
import { MOCK_COST_CODES } from "@/lib/data/mock/cost-codes";
export function useCostCodes() {
  return useSyncExternalStore(subscribeCostCodes, getCostCodesSnapshot, () => MOCK_COST_CODES);
}
