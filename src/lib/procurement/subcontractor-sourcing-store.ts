"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import type { SubcontractorSourcingRequest } from "@/types/subcontractor-sourcing";

const SEED_DATA: SubcontractorSourcingRequest[] = [];

function fromRow(row: Record<string, any>): SubcontractorSourcingRequest {
  return {
    id: row.id,
    projectId: row.project_id ?? undefined,
    propertyId: row.property_id ?? undefined,
    propertyName: row.property_name ?? undefined,
    trade: row.trade,
    scopeOfWork: row.scope_of_work,
    budget: row.budget != null ? Number(row.budget) : undefined,
    notes: row.notes ?? undefined,
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
  if (input.propertyId !== undefined) row.property_id = input.propertyId;
  if (input.propertyName !== undefined) row.property_name = input.propertyName;
  if (input.trade !== undefined) row.trade = input.trade;
  if (input.scopeOfWork !== undefined) row.scope_of_work = input.scopeOfWork;
  if (input.budget !== undefined) row.budget = input.budget;
  if (input.notes !== undefined) row.notes = input.notes;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<SubcontractorSourcingRequest>({
  table: "subcontractor_sourcing_requests",
  seedData: SEED_DATA,
  fromRow,
  toRow,
  orderBy: "created_date",
});

export const subscribeSubcontractorSourcing = store.subscribe;
export const getSubcontractorSourcingSnapshot = store.getSnapshot;

export interface SubcontractorSourcingInput {
  projectId?: string;
  propertyId?: string;
  propertyName?: string;
  trade: string;
  scopeOfWork: string;
  budget?: number;
  notes?: string;
}

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, s) => {
    const n = parseInt(s.id.replace("SUBSRC-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `SUBSRC-${String(maxNum + 1).padStart(6, "0")}`;
}

export async function createSubcontractorSourcing(input: SubcontractorSourcingInput): Promise<{ ok: boolean; error?: string }> {
  const id = nextId();
  const result = await store.create({ id, ...input });
  return result !== null ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}

export async function updateSubcontractorSourcing(id: string, input: SubcontractorSourcingInput): Promise<{ ok: boolean; error?: string }> {
  const ok = await store.update(id, input);
  return ok ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}

export function deleteSubcontractorSourcing(id: string) {
  void store.remove(id);
}
