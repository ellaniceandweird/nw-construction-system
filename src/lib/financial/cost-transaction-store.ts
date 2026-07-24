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
  if (input.date !== undefined) row.date = input.date;
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

export function createCostTransaction(input: CostTransactionInput) {
  const id = nextId();
  void store.create({ id, sourceModule: "manual", ...input });
  return id;
}

export function deleteCostTransaction(id: string) {
  void store.remove(id);
}
