"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import type { MaterialReference } from "@/types/material-reference";

const SEED_DATA: MaterialReference[] = [];

function fromRow(row: Record<string, any>): MaterialReference {
  return {
    id: row.id,
    materialName: row.material_name,
    category: row.category ?? undefined,
    specification: row.specification ?? undefined,
    preferredVendor: row.preferred_vendor ?? undefined,
    referenceUrl: row.reference_url ?? undefined,
    notes: row.notes ?? undefined,
    createdBy: row.created_by ?? "system",
    createdDate: row.created_date ?? new Date().toISOString(),
    lastModifiedBy: row.last_modified_by ?? "system",
    lastModifiedDate: row.last_modified_date ?? new Date().toISOString(),
    revisionNumber: row.revision_number ?? 1,
    module: "Documents",
    status: row.status ?? "active",
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.materialName !== undefined) row.material_name = input.materialName;
  if (input.category !== undefined) row.category = input.category;
  if (input.specification !== undefined) row.specification = input.specification;
  if (input.preferredVendor !== undefined) row.preferred_vendor = input.preferredVendor;
  if (input.referenceUrl !== undefined) row.reference_url = input.referenceUrl;
  if (input.notes !== undefined) row.notes = input.notes;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<MaterialReference>({
  table: "material_references",
  seedData: SEED_DATA,
  fromRow,
  toRow,
  orderBy: "material_name",
});

export const subscribeMaterialReferences = store.subscribe;
export const getMaterialReferencesSnapshot = store.getSnapshot;

export interface MaterialReferenceInput {
  materialName: string;
  category?: string;
  specification?: string;
  preferredVendor?: string;
  referenceUrl?: string;
  notes?: string;
}

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, m) => {
    const n = parseInt(m.id.replace("MREF-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `MREF-${String(maxNum + 1).padStart(6, "0")}`;
}

export async function createMaterialReference(input: MaterialReferenceInput): Promise<{ ok: boolean; error?: string }> {
  const id = nextId();
  const result = await store.create({ id, ...input });
  return result !== null ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}

export async function updateMaterialReference(id: string, input: MaterialReferenceInput): Promise<{ ok: boolean; error?: string }> {
  const ok = await store.update(id, input);
  return ok ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}

export function deleteMaterialReference(id: string) {
  void store.remove(id);
}
