"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_ESTIMATES } from "@/lib/data/mock/estimates";
import { computeEstimateTotal, computeLineItemTotal } from "@/lib/estimating/estimate-calculations";
import type { Estimate, EstimateLineItem, EstimateStatus } from "@/types/estimating";

function fromRow(row: Record<string, any>): Estimate {
  return {
    id: row.id,
    projectId: row.project_id,
    estimateNumber: row.estimate_number,
    client: row.client ?? undefined,
    address: row.address ?? undefined,
    estimator: row.estimator,
    estimateDate: row.estimate_date,
    revision: row.revision ?? 1,
    estimateStatus: row.estimate_status,
    proposalNumber: row.proposal_number ?? undefined,
    currency: row.currency ?? "USD",
    taxMethod: row.tax_method ?? undefined,
    profitMarginPercent: row.profit_margin_percent != null ? Number(row.profit_margin_percent) : undefined,
    markupPercent: row.markup_percent != null ? Number(row.markup_percent) : undefined,
    notes: row.notes ?? undefined,
    lineItems: row.line_items ?? [],
    takeoffItems: row.takeoff_items ?? undefined,
    subcontractOptions: row.subcontract_options ?? undefined,
    indirectCosts: row.indirect_costs ?? undefined,
    contingency: row.contingency ?? undefined,
    totalEstimatedCost: Number(row.total_estimated_cost ?? 0),
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
  if (input.estimateNumber !== undefined) row.estimate_number = input.estimateNumber;
  if (input.client !== undefined) row.client = input.client;
  if (input.address !== undefined) row.address = input.address;
  if (input.estimator !== undefined) row.estimator = input.estimator;
  if (input.estimateDate !== undefined) row.estimate_date = input.estimateDate;
  if (input.revision !== undefined) row.revision = input.revision;
  if (input.estimateStatus !== undefined) row.estimate_status = input.estimateStatus;
  if (input.proposalNumber !== undefined) row.proposal_number = input.proposalNumber;
  if (input.currency !== undefined) row.currency = input.currency;
  if (input.taxMethod !== undefined) row.tax_method = input.taxMethod;
  if (input.profitMarginPercent !== undefined) row.profit_margin_percent = input.profitMarginPercent;
  if (input.markupPercent !== undefined) row.markup_percent = input.markupPercent;
  if (input.notes !== undefined) row.notes = input.notes;
  if (input.lineItems !== undefined) row.line_items = input.lineItems;
  if (input.takeoffItems !== undefined) row.takeoff_items = input.takeoffItems;
  if (input.subcontractOptions !== undefined) row.subcontract_options = input.subcontractOptions;
  if (input.indirectCosts !== undefined) row.indirect_costs = input.indirectCosts;
  if (input.contingency !== undefined) row.contingency = input.contingency;
  if (input.totalEstimatedCost !== undefined) row.total_estimated_cost = input.totalEstimatedCost;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<Estimate>({
  table: "estimates",
  seedData: MOCK_ESTIMATES,
  fromRow,
  toRow,
  orderBy: "estimate_date",
});

export const subscribeEstimates = store.subscribe;
export const getEstimatesSnapshot = store.getSnapshot;

export function withComputedLineItemTotals(
  lineItems: Omit<EstimateLineItem, "totalCost">[]
): EstimateLineItem[] {
  return lineItems.map((li) => ({ ...li, totalCost: computeLineItemTotal(li) }));
}

export interface EstimateEditInput {
  projectId: string;
  client?: string;
  address?: string;
  estimator: string;
  estimateDate: string;
  estimateStatus: EstimateStatus;
  proposalNumber?: string;
  taxMethod?: string;
  notes?: string;
  lineItems: EstimateLineItem[];
  indirectCosts?: Estimate["indirectCosts"];
  contingency?: Estimate["contingency"];
}

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, e) => {
    const n = parseInt(e.id.replace("EST-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `EST-${String(maxNum + 1).padStart(6, "0")}`;
}

function nextEstimateNumber(): string {
  const year = new Date().getFullYear();
  const items = store.getSnapshot();
  return `EST-${year}-${String(items.length + 1).padStart(4, "0")}`;
}

export function createEstimate(input: EstimateEditInput) {
  const id = nextId();
  void store.create({
    id,
    estimateNumber: nextEstimateNumber(),
    revision: 1,
    currency: "USD",
    totalEstimatedCost: computeEstimateTotal(input.lineItems, input.indirectCosts, input.contingency),
    ...input,
  });
  return id;
}

export function updateEstimate(id: string, input: EstimateEditInput) {
  const existing = store.getSnapshot().find((e) => e.id === id);
  void store.update(id, {
    ...input,
    revision: (existing?.revision ?? 1) + 1,
    totalEstimatedCost: computeEstimateTotal(input.lineItems, input.indirectCosts, input.contingency),
  });
}

export function deleteEstimate(id: string) {
  void store.remove(id);
}
