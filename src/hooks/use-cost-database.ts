"use client";
import { useSyncExternalStore } from "react";
import { subscribeCostDatabase, getCostDatabaseSnapshot } from "@/lib/estimating/cost-database-store";
import { MOCK_COST_DATABASE } from "@/lib/data/mock/cost-database";
export function useCostDatabase() {
  return useSyncExternalStore(subscribeCostDatabase, getCostDatabaseSnapshot, () => MOCK_COST_DATABASE);
}
