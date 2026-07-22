"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_COST_DATABASE } from "@/lib/data/mock/cost-database";
import type { CostDatabaseItem } from "@/types/estimating";

function fromRow(row: Record<string, any>): CostDatabaseItem {
  return {
    id: row.id,
    costCode: row.cost_code,
    description: row.description,
    category: row.category ?? undefined,
    unit: row.unit,
    laborCost: Number(row.labor_cost ?? 0),
    materialCost: Number(row.material_cost ?? 0),
    equipmentCost: Number(row.equipment_cost ?? 0),
    subcontractCost: Number(row.subcontract_cost ?? 0),
    overheadPercent: row.overhead_percent != null ? Number(row.overhead_percent) : undefined,
    profitPercent: row.profit_percent != null ? Number(row.profit_percent) : undefined,
    lastUpdated: row.last_updated,
    supplier: row.supplier ?? undefined,
    historicalAverage: row.historical_average != null ? Number(row.historical_average) : undefined,
    createdBy: row.created_by ?? "system",
    createdDate: row.created_date ?? new Date().toISOString(),
    lastModifiedBy: row.last_modified_by ?? "system",
    lastModifiedDate: row.last_modified_date ?? new Date().toISOString(),
    revisionNumber: row.revision_number ?? 1,
    module: "Estimating",
    status: row.status ?? "active",
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.costCode !== undefined) row.cost_code = input.costCode;
  if (input.description !== undefined) row.description = input.description;
  if (input.category !== undefined) row.category = input.category;
  if (input.unit !== undefined) row.unit = input.unit;
  if (input.laborCost !== undefined) row.labor_cost = input.laborCost;
  if (input.materialCost !== undefined) row.material_cost = input.materialCost;
  if (input.equipmentCost !== undefined) row.equipment_cost = input.equipmentCost;
  if (input.subcontractCost !== undefined) row.subcontract_cost = input.subcontractCost;
  if (input.overheadPercent !== undefined) row.overhead_percent = input.overheadPercent;
  if (input.profitPercent !== undefined) row.profit_percent = input.profitPercent;
  if (input.supplier !== undefined) row.supplier = input.supplier;
  if (input.historicalAverage !== undefined) row.historical_average = input.historicalAverage;
  row.last_updated = new Date().toISOString().slice(0, 10);
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<CostDatabaseItem>({
  table: "cost_database",
  seedData: MOCK_COST_DATABASE,
  fromRow,
  toRow,
  orderBy: "cost_code",
});

export const subscribeCostDatabase = store.subscribe;
export const getCostDatabaseSnapshot = store.getSnapshot;

export function findRateForCostCode(costCode: string): CostDatabaseItem | undefined {
  return store.getSnapshot().find((r) => r.costCode === costCode);
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

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, r) => {
    const n = parseInt(r.id.replace("CDB-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `CDB-${String(maxNum + 1).padStart(6, "0")}`;
}

export function createCostDatabaseItem(input: CostDatabaseInput) {
  const id = nextId();
  void store.create({ id, ...input });
  return id;
}
export function updateCostDatabaseItem(id: string, input: CostDatabaseInput) {
  void store.update(id, input);
}
export function deleteCostDatabaseItem(id: string) {
  void store.remove(id);
}
