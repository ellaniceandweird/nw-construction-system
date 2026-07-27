"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import type { ApprovalRequest, ApproverName, ApprovalKind } from "@/types/approvals";

function fromRow(row: Record<string, any>): ApprovalRequest {
  return {
    id: row.id,
    kind: row.kind,
    sourceId: row.source_id ?? undefined,
    title: row.title,
    projectName: row.project_name,
    amount: Number(row.amount ?? 0),
    requestedBy: row.requested_by,
    requestedDate: row.requested_date,
    requiredApprovers: row.required_approvers ?? [],
    sjaakApprovedDate: row.sjaak_approved_date ?? undefined,
    carloApprovedDate: row.carlo_approved_date ?? undefined,
    benApprovedDate: row.ben_approved_date ?? undefined,
    approvalStatus: row.approval_status,
    notes: row.notes ?? undefined,
    createdBy: row.created_by ?? "system",
    createdDate: row.created_date ?? new Date().toISOString(),
    lastModifiedBy: row.last_modified_by ?? "system",
    lastModifiedDate: row.last_modified_date ?? new Date().toISOString(),
    revisionNumber: row.revision_number ?? 1,
    module: "Approvals",
    status: row.status ?? "active",
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.kind !== undefined) row.kind = input.kind;
  if (input.sourceId !== undefined) row.source_id = input.sourceId;
  if (input.title !== undefined) row.title = input.title;
  if (input.projectName !== undefined) row.project_name = input.projectName;
  if (input.amount !== undefined) row.amount = input.amount;
  if (input.requestedBy !== undefined) row.requested_by = input.requestedBy;
  if (input.requestedDate !== undefined) row.requested_date = input.requestedDate;
  if (input.requiredApprovers !== undefined) row.required_approvers = input.requiredApprovers;
  if (input.sjaakApprovedDate !== undefined) row.sjaak_approved_date = input.sjaakApprovedDate;
  if (input.carloApprovedDate !== undefined) row.carlo_approved_date = input.carloApprovedDate;
  if (input.benApprovedDate !== undefined) row.ben_approved_date = input.benApprovedDate;
  if (input.approvalStatus !== undefined) row.approval_status = input.approvalStatus;
  if (input.notes !== undefined) row.notes = input.notes;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<ApprovalRequest>({
  table: "approval_requests",
  seedData: [],
  fromRow,
  toRow,
  orderBy: "requested_date",
});

export const subscribeApprovalRequests = store.subscribe;
export const getApprovalRequestsSnapshot = store.getSnapshot;

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, a) => {
    const n = parseInt(a.id.replace("APR-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `APR-${String(maxNum + 1).padStart(6, "0")}`;
}

export interface ApprovalRequestInput {
  kind: ApprovalKind;
  sourceId?: string;
  title: string;
  projectName: string;
  amount: number;
  requestedBy: string;
  requestedDate: string;
  requiredApprovers: ApproverName[];
  notes?: string;
}

export function createApprovalRequest(input: ApprovalRequestInput) {
  const id = nextId();
  void store.create({ id, approvalStatus: "pending", ...input });
  return id;
}

export function updateApprovalRequest(id: string, input: ApprovalRequestInput) {
  void store.update(id, input);
}

export function deleteApprovalRequest(id: string) {
  void store.remove(id);
}

const APPROVER_FIELD: Record<ApproverName, "sjaakApprovedDate" | "carloApprovedDate" | "benApprovedDate"> = {
  Sjaak: "sjaakApprovedDate",
  Carlo: "carloApprovedDate",
  Ben: "benApprovedDate",
};

/** Records that one specific approver signed off, and marks the whole request approved once everyone required has. */
export function recordApproval(id: string, approver: ApproverName) {
  const existing = store.getSnapshot().find((a) => a.id === id);
  if (!existing) return;
  const today = new Date().toISOString().slice(0, 10);
  const patch: Record<string, any> = { [APPROVER_FIELD[approver]]: today };

  const approvedSoFar = new Set<ApproverName>(
    (Object.keys(APPROVER_FIELD) as ApproverName[]).filter((a) =>
      a === approver ? true : !!existing[APPROVER_FIELD[a]]
    )
  );
  const allSignedOff = existing.requiredApprovers.every((a) => approvedSoFar.has(a));
  if (allSignedOff) patch.approvalStatus = "approved";

  void store.update(id, patch);
}

/** Undoes one approver's sign-off (in case of a mistaken click) and reopens the request if it had been fully approved. */
export function revokeApproval(id: string, approver: ApproverName) {
  const existing = store.getSnapshot().find((a) => a.id === id);
  if (!existing) return;
  void store.update(id, { [APPROVER_FIELD[approver]]: null, approvalStatus: "pending" });
}

export function rejectApprovalRequest(id: string) {
  void store.update(id, { approvalStatus: "rejected" });
}
