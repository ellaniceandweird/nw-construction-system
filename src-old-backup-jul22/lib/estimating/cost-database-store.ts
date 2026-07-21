"use client";

import { MOCK_COST_DATABASE } from "@/lib/data/mock/cost-database";
import type { CostDatabaseItem } from "@/types/estimating";

const STORAGE_KEY = "project-nw:cost-database";
type Listener = () => void;
let rates: CostDatabaseItem[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): CostDatabaseItem[] {
  if (typeof window === "undefined") return MOCK_COST_DATABASE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return MOCK_COST_DATABASE;
    return JSON.parse(raw) as CostDatabaseItem[];
  } catch {
    return MOCK_COST_DATABASE;
  }
}
function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
}
function emit() {
  listeners.forEach((l) => l());
}
function nextId(): string {
  const maxNum = rates.reduce((max, r) => {
    const n = parseInt(r.id.replace("CDB-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `CDB-${String(maxNum + 1).padStart(6, "0")}`;
}

export function subscribeCostDatabase(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function getCostDatabaseSnapshot(): CostDatabaseItem[] {
  return rates;
}
export function findRateForCostCode(costCode: string): CostDatabaseItem | undefined {
  return rates.find((r) => r.costCode === costCode);
}

export interface CostDatabaseInput {
  costCode: string;
  description: string;
  unit: string;
  laborCost: number;
  materialCost: number;
  equipmentCost: number;
  subcontractCost: number;
  profitPercent?: number;
  supplier?: string;
}

export function createCostDatabaseItem(input: CostDatabaseInput) {
  const newItem: CostDatabaseItem = {
    id: nextId(),
    createdBy: "user", createdDate: new Date().toISOString(),
    lastModifiedBy: "user", lastModifiedDate: new Date().toISOString(),
    revisionNumber: 1, module: "Estimating", status: "active",
    lastUpdated: new Date().toISOString().slice(0, 10),
    ...input,
  };
  rates = [...rates, newItem];
  persist();
  emit();
  return newItem;
}
export function updateCostDatabaseItem(id: string, input: CostDatabaseInput) {
  rates = rates.map((r) =>
    r.id === id ? { ...r, ...input, lastUpdated: new Date().toISOString().slice(0, 10), lastModifiedDate: new Date().toISOString() } : r
  );
  persist();
  emit();
}
export function deleteCostDatabaseItem(id: string) {
  rates = rates.filter((r) => r.id !== id);
  persist();
  emit();
}
