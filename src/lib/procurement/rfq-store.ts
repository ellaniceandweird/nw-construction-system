"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_RFQS } from "@/lib/data/mock/rfqs";
import { scoreResponses } from "@/lib/procurement/quote-scoring";
import type { RequestForQuotation, VendorQuoteResponse } from "@/types/procurement";

function fromRow(row: Record<string, any>): RequestForQuotation {
  return {
    id: row.id,
    projectId: row.project_id,
    rfqNumber: row.rfq_number,
    materialRequestId: row.material_request_id ?? undefined,
    vendorIds: row.vendor_ids ?? [],
    issueDate: row.issue_date,
    dueDate: row.due_date,
    scope: row.scope ?? undefined,
    materialList: row.material_list,
    notes: row.notes ?? undefined,
    responses: row.responses ?? [],
    attachments: row.attachments ?? undefined,
    awardedVendorId: row.awarded_vendor_id ?? undefined,
    manualStatus: row.manual_status ?? undefined,
    createdBy: row.created_by ?? "system",
    createdDate: row.created_date ?? new Date().toISOString(),
    lastModifiedBy: row.last_modified_by ?? "system",
    lastModifiedDate: row.last_modified_date ?? new Date().toISOString(),
    revisionNumber: row.revision_number ?? 1,
    module: "Procurement",
    status: row.status ?? "active",
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.projectId !== undefined) row.project_id = input.projectId;
  if (input.rfqNumber !== undefined) row.rfq_number = input.rfqNumber;
  if (input.materialRequestId !== undefined) row.material_request_id = input.materialRequestId;
  if (input.vendorIds !== undefined) row.vendor_ids = input.vendorIds;
  if (input.issueDate !== undefined) row.issue_date = input.issueDate;
  if (input.dueDate !== undefined) row.due_date = input.dueDate;
  if (input.scope !== undefined) row.scope = input.scope;
  if (input.materialList !== undefined) row.material_list = input.materialList;
  if (input.notes !== undefined) row.notes = input.notes;
  if (input.responses !== undefined) row.responses = input.responses;
  if (input.attachments !== undefined) row.attachments = input.attachments;
  if (input.awardedVendorId !== undefined) row.awarded_vendor_id = input.awardedVendorId;
  if (input.manualStatus !== undefined) row.manual_status = input.manualStatus;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<RequestForQuotation>({
  table: "rfqs",
  seedData: MOCK_RFQS,
  fromRow,
  toRow,
  orderBy: "due_date",
});

export const subscribeRFQs = store.subscribe;
export const getRFQsSnapshot = store.getSnapshot;

function nextRfqNumber(): string {
  const year = new Date().getFullYear();
  const seq = store.getSnapshot().length + 1;
  return `RFQ-${year}-${String(seq).padStart(4, "0")}`;
}

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, r) => {
    const n = parseInt(r.id.replace("RFQ-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `RFQ-${String(maxNum + 1).padStart(6, "0")}`;
}

export interface CreateRFQInput {
  projectId: string;
  materialRequestId?: string;
  vendorIds: string[];
  issueDate: string;
  dueDate: string;
  scope?: string;
  materialList: string;
  notes?: string;
  attachments?: { name: string; url: string }[];
}

export function createRFQ(input: CreateRFQInput) {
  const id = nextId();
  void store.create({ id, rfqNumber: nextRfqNumber(), responses: [], ...input });
  return id;
}

export interface RFQEditInput {
  projectId?: string;
  materialRequestId?: string;
  vendorIds?: string[];
  issueDate?: string;
  dueDate?: string;
  scope?: string;
  materialList?: string;
  notes?: string;
  manualStatus?: "cancelled" | "closed";
}

export function updateRFQ(id: string, input: RFQEditInput) {
  const existing = store.getSnapshot().find((r) => r.id === id);
  if (!existing) return;
  const patch: Record<string, any> = { ...input };
  // If the invited-vendor list shrank, drop responses/award for vendors no longer invited.
  if (input.vendorIds) {
    patch.responses = scoreResponses(
      existing.responses.filter((resp) => input.vendorIds!.includes(resp.vendorId))
    );
    if (existing.awardedVendorId && !input.vendorIds.includes(existing.awardedVendorId)) {
      patch.awardedVendorId = null;
    }
  }
  void store.update(id, patch);
}

export type QuoteResponseInput = Omit<VendorQuoteResponse, "overallScore">;

/** Adds a new vendor quote response, or updates it if that vendor already responded. */
export function upsertQuoteResponse(rfqId: string, input: QuoteResponseInput) {
  const existing = store.getSnapshot().find((r) => r.id === rfqId);
  if (!existing) return;
  const withoutVendor = existing.responses.filter((resp) => resp.vendorId !== input.vendorId);
  const rescored = scoreResponses([...withoutVendor, input]);
  void store.update(rfqId, { responses: rescored });
}

export function removeQuoteResponse(rfqId: string, vendorId: string) {
  const existing = store.getSnapshot().find((r) => r.id === rfqId);
  if (!existing) return;
  const remaining = existing.responses.filter((resp) => resp.vendorId !== vendorId);
  const rescored = scoreResponses(remaining);
  const awardedVendorId = existing.awardedVendorId === vendorId ? null : existing.awardedVendorId;
  void store.update(rfqId, { responses: rescored, awardedVendorId });
}

export function awardRFQ(rfqId: string, vendorId: string | undefined) {
  void store.update(rfqId, { awardedVendorId: vendorId ?? null });
}

/** Derived status — RFQs don't store status directly; it's computed from responses, unless manually overridden. */
export function getRFQStatus(
  r: RequestForQuotation
): "open" | "partial" | "quoted" | "awarded" | "cancelled" | "closed" {
  if (r.manualStatus) return r.manualStatus;
  if (r.awardedVendorId) return "awarded";
  if (r.responses.length === 0) return "open";
  if (r.responses.length < r.vendorIds.length) return "partial";
  return "quoted";
}
