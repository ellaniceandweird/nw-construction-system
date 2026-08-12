"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_COST_CODES } from "@/lib/data/mock/cost-codes";
import type { CostCode } from "@/types/estimating";

function fromRow(row: Record<string, any>): CostCode {
  return {
    id: row.id,
    code: row.code,
    description: row.description,
    division: row.division,
    trade: row.trade ?? undefined,
    category: row.category ?? undefined,
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
  if (input.code !== undefined) row.code = input.code;
  if (input.description !== undefined) row.description = input.description;
  if (input.division !== undefined) row.division = input.division;
  if (input.trade !== undefined) row.trade = input.trade;
  if (input.category !== undefined) row.category = input.category;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<CostCode>({
  table: "cost_codes",
  seedData: MOCK_COST_CODES,
  fromRow,
  toRow,
  orderBy: "code",
});

export const subscribeCostCodes = store.subscribe;
export const getCostCodesSnapshot = store.getSnapshot;

export interface CostCodeInput {
  code: string;
  description: string;
  division: string;
  trade?: string;
  category?: string;
}

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, c) => {
    const n = parseInt(c.id.replace("CC-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `CC-${String(maxNum + 1).padStart(6, "0")}`;
}

export async function createCostCode(input: CostCodeInput): Promise<{ ok: boolean; error?: string }> {
  const id = nextId();
  const result = await store.create({ id, ...input });
  return result !== null ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}
export async function updateCostCode(id: string, input: CostCodeInput): Promise<{ ok: boolean; error?: string }> {
  const ok = await store.update(id, input);
  return ok ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}
export function deleteCostCode(id: string) {
  void store.remove(id);
}
