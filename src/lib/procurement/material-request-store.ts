"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_MATERIAL_REQUESTS } from "@/lib/data/mock/material-requests";
import type { MaterialRequest, MaterialRequestStatus } from "@/types/procurement";

function fromRow(row: Record<string, any>): MaterialRequest {
  return {
    id: row.id,
    projectId: row.project_id,
    mrNumber: row.mr_number,
    activityId: row.activity_id ?? undefined,
    requestedBy: row.requested_by,
    department: row.department ?? undefined,
    priority: row.priority,
    requestDate: row.request_date,
    requiredOnSiteDate: row.required_on_site_date,
    approvalStatus: row.approval_status,
    estimatedCost: row.estimated_cost != null ? Number(row.estimated_cost) : undefined,
    notes: row.notes ?? undefined,
    referenceUrl: row.reference_url ?? undefined,
    requestStatus: row.request_status,
    lineItems: row.line_items ?? [],
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
  if (input.mrNumber !== undefined) row.mr_number = input.mrNumber;
  if (input.requestedBy !== undefined) row.requested_by = input.requestedBy;
  if (input.priority !== undefined) row.priority = input.priority;
  if (input.requestDate !== undefined) row.request_date = input.requestDate;
  if (input.requiredOnSiteDate !== undefined) row.required_on_site_date = input.requiredOnSiteDate;
  if (input.approvalStatus !== undefined) row.approval_status = input.approvalStatus;
  if (input.notes !== undefined) row.notes = input.notes;
  if (input.referenceUrl !== undefined) row.reference_url = input.referenceUrl;
  if (input.requestStatus !== undefined) row.request_status = input.requestStatus;
  if (input.lineItems !== undefined) row.line_items = input.lineItems;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<MaterialRequest>({
  table: "material_requests",
  seedData: MOCK_MATERIAL_REQUESTS,
  fromRow,
  toRow,
  orderBy: "required_on_site_date",
});

export const subscribeMaterialRequests = store.subscribe;
export const getMaterialRequestsSnapshot = store.getSnapshot;

export interface MaterialRequestEditInput {
  requestStatus: MaterialRequestStatus;
  notes?: string;
  referenceUrl?: string;
}

export function updateMaterialRequest(id: string, input: MaterialRequestEditInput) {
  void store.update(id, input);
}

export interface MaterialRequestCreateInput {
  projectId: string;
  description: string;
  quantity: number;
  unit: string;
  requiredOnSiteDate: string;
  requestedBy: string;
  notes?: string;
  referenceUrl?: string;
}

function nextMrNumber(): string {
  const items = store.getSnapshot();
  const nums = items
    .map((r) => parseInt(r.mrNumber.replace(/\D/g, ""), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `MR-${(max + 1).toString().padStart(5, "0")}`;
}

export function createMaterialRequest(input: MaterialRequestCreateInput) {
  const mrNumber = nextMrNumber();
  void store.create({
    id: mrNumber,
    projectId: input.projectId,
    mrNumber,
    requestedBy: input.requestedBy,
    priority: "medium",
    requestDate: new Date().toISOString().slice(0, 10),
    requiredOnSiteDate: input.requiredOnSiteDate,
    approvalStatus: "pending",
    notes: input.notes,
    referenceUrl: input.referenceUrl,
    requestStatus: "draft",
    lineItems: [{ description: input.description, quantity: input.quantity, unit: input.unit }],
  });
  return mrNumber;
}
