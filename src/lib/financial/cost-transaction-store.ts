"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_COST_TRANSACTIONS } from "@/lib/data/mock/cost-transactions";
import type { CostTransaction } from "@/types/financial";

function fromRow(row: Record<string, any>): CostTransaction {
  return {
    id: row.id,
    projectId: row.project_id,
    activityId: row.activity_id ?? undefined,
    costCode: row.cost_code,
    category: row.category,
    description: row.description,
    vendorId: row.vendor_id ?? undefined,
    date: row.date,
    amount: Number(row.amount ?? 0),
    billingEntityId: row.billing_entity_id ?? undefined,
    referenceNumber: row.reference_number ?? undefined,
    sourceModule: row.source_module ?? "manual",
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
  if (input.activityId !== undefined) row.activity_id = input.activityId;
  if (input.costCode !== undefined) row.cost_code = input.costCode;
  if (input.category !== undefined) row.category = input.category;
  if (input.description !== undefined) row.description = input.description;
  if (input.vendorId !== undefined) row.vendor_id = input.vendorId;
  if (input.date !== undefined) row.date = input.date || null;
  if (input.amount !== undefined) row.amount = input.amount;
  if (input.billingEntityId !== undefined) row.billing_entity_id = input.billingEntityId;
  if (input.referenceNumber !== undefined) row.reference_number = input.referenceNumber;
  if (input.sourceModule !== undefined) row.source_module = input.sourceModule;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<CostTransaction>({
  table: "cost_transactions",
  seedData: MOCK_COST_TRANSACTIONS,
  fromRow,
  toRow,
  orderBy: "date",
});

export const subscribeCostTransactions = store.subscribe;
export const getCostTransactionsSnapshot = store.getSnapshot;

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, t) => {
    const n = parseInt(t.id.replace("CTX-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `CTX-${String(maxNum + 1).padStart(6, "0")}`;
}

export interface CostTransactionInput {
  projectId: string;
  costCode: string;
  category: CostTransaction["category"];
  description: string;
  vendorId?: string;
  date: string;
  amount: number;
  referenceNumber?: string;
}

export async function createCostTransaction(input: CostTransactionInput): Promise<{ ok: boolean; error?: string; id: string }> {
  const id = nextId();
  const result = await store.create({ id, sourceModule: "manual", ...input });
  return result !== null
    ? { ok: true, id }
    : { ok: false, error: store.getLastError() ?? undefined, id };
}

/**
 * Creates many manual cost entries at once (bulk paste / import). IDs are
 * computed once upfront and incremented locally in this loop, rather
 * than each call re-reading the store's snapshot via nextId() — since
 * the snapshot doesn't reflect an in-flight create until it resolves,
 * calling nextId() repeatedly in a tight loop risks generating the same
 * ID twice and colliding on the unique constraint.
 */
export async function createCostTransactionsBulk(inputs: CostTransactionInput[]): Promise<{ succeeded: number; failed: { row: number; error?: string }[] }> {
  const items = store.getSnapshot();
  let maxNum = items.reduce((max, t) => {
    const n = parseInt(t.id.replace("CTX-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  const failed: { row: number; error?: string }[] = [];
  let succeeded = 0;
  for (let i = 0; i < inputs.length; i++) {
    maxNum += 1;
    const id = `CTX-${String(maxNum).padStart(6, "0")}`;
    const result = await store.create({ id, sourceModule: "manual", ...inputs[i] });
    if (result !== null) succeeded++;
    else failed.push({ row: i + 1, error: store.getLastError() ?? undefined });
  }
  return { succeeded, failed };
}

export async function updateCostTransaction(id: string, input: CostTransactionInput): Promise<{ ok: boolean; error?: string }> {
  const ok = await store.update(id, input);
  return ok ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}

export function deleteCostTransaction(id: string) {
  void store.remove(id);
}
