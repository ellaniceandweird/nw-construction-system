"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_CHANGE_ORDERS } from "@/lib/data/mock/change-orders";
import type { ChangeOrder, ChangeOrderStatus } from "@/types/change-orders";

function fromRow(row: Record<string, any>): ChangeOrder {
  return {
    id: row.id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    changeOrderNumber: row.change_order_number,
    description: row.description,
    reason: row.reason ?? undefined,
    costImpact: Number(row.cost_impact ?? 0),
    scheduleImpactDays: row.schedule_impact_days ?? undefined,
    relatedItem: row.related_item ?? undefined,
    changeOrderStatus: row.change_order_status,
    requestedBy: row.requested_by ?? undefined,
    requestedDate: row.requested_date,
    approvedBy: row.approved_by ?? undefined,
    approvedDate: row.approved_date ?? undefined,
    notes: row.notes ?? undefined,
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
  if (input.projectId !== undefined) row.project_id = input.projectId;
  if (input.estimateId !== undefined) row.estimate_id = input.estimateId;
  if (input.changeOrderNumber !== undefined) row.change_order_number = input.changeOrderNumber;
  if (input.description !== undefined) row.description = input.description;
  if (input.reason !== undefined) row.reason = input.reason;
  if (input.costImpact !== undefined) row.cost_impact = input.costImpact;
  if (input.scheduleImpactDays !== undefined) row.schedule_impact_days = input.scheduleImpactDays;
  if (input.relatedItem !== undefined) row.related_item = input.relatedItem;
  if (input.changeOrderStatus !== undefined) row.change_order_status = input.changeOrderStatus;
  if (input.requestedBy !== undefined) row.requested_by = input.requestedBy;
  if (input.requestedDate !== undefined) row.requested_date = input.requestedDate;
  if (input.approvedBy !== undefined) row.approved_by = input.approvedBy;
  if (input.approvedDate !== undefined) row.approved_date = input.approvedDate;
  if (input.notes !== undefined) row.notes = input.notes;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<ChangeOrder>({
  table: "change_orders",
  seedData: MOCK_CHANGE_ORDERS,
  fromRow,
  toRow,
  orderBy: "requested_date",
});

export const subscribeChangeOrders = store.subscribe;
export const getChangeOrdersSnapshot = store.getSnapshot;

export interface ChangeOrderInput {
  projectId: string;
  estimateId: string;
  description: string;
  reason?: string;
  costImpact: number;
  scheduleImpactDays?: number;
  relatedItem?: string;
  changeOrderStatus: ChangeOrderStatus;
  requestedBy?: string;
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  notes?: string;
}

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, c) => {
    const n = parseInt(c.id.replace("CO-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `CO-${String(maxNum + 1).padStart(6, "0")}`;
}

function nextNumber(): string {
  const year = new Date().getFullYear();
  const items = store.getSnapshot();
  return `CO-${year}-${String(items.length + 1).padStart(4, "0")}`;
}

export function createChangeOrder(input: ChangeOrderInput) {
  const id = nextId();
  void store.create({ id, changeOrderNumber: nextNumber(), ...input });
  return id;
}

export function updateChangeOrder(id: string, input: ChangeOrderInput) {
  void store.update(id, input);
}

export function deleteChangeOrder(id: string) {
  void store.remove(id);
}

/** Sum of approved change orders' cost impact for one estimate — the amount added to (or subtracted from) the original budget. */
export function computeApprovedChangesTotal(estimateId: string, allChangeOrders: ChangeOrder[]): number {
  return allChangeOrders
    .filter((c) => c.estimateId === estimateId && c.changeOrderStatus === "approved")
    .reduce((sum, c) => sum + c.costImpact, 0);
}
