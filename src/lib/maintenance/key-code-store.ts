"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import type { KeyCodeEntry } from "@/types/maintenance";

function fromRow(row: Record<string, any>): KeyCodeEntry {
  return {
    id: row.id,
    propertyId: row.property_id ?? undefined,
    propertyName: row.property_name,
    spaceName: row.space_name ?? undefined,
    doorIdentifier: row.door_identifier,
    accessCode: row.access_code ?? undefined,
    notes: row.notes ?? undefined,
    createdBy: row.created_by ?? "system",
    createdDate: row.created_date ?? new Date().toISOString(),
    lastModifiedBy: row.last_modified_by ?? "system",
    lastModifiedDate: row.last_modified_date ?? new Date().toISOString(),
    revisionNumber: row.revision_number ?? 1,
    module: "Maintenance",
    status: row.status ?? "active",
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.propertyId !== undefined) row.property_id = input.propertyId;
  if (input.propertyName !== undefined) row.property_name = input.propertyName;
  if (input.spaceName !== undefined) row.space_name = input.spaceName;
  if (input.doorIdentifier !== undefined) row.door_identifier = input.doorIdentifier;
  if (input.accessCode !== undefined) row.access_code = input.accessCode;
  if (input.notes !== undefined) row.notes = input.notes;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<KeyCodeEntry>({
  table: "key_codes",
  seedData: [],
  fromRow,
  toRow,
  orderBy: "property_name",
});

export const subscribeKeyCodes = store.subscribe;
export const getKeyCodesSnapshot = store.getSnapshot;

export interface KeyCodeInput {
  propertyId?: string;
  propertyName: string;
  spaceName?: string;
  doorIdentifier: string;
  accessCode?: string;
  notes?: string;
}

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, e) => {
    const n = parseInt(e.id.replace("KEY-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `KEY-${String(maxNum + 1).padStart(6, "0")}`;
}

export async function createKeyCodeEntry(input: KeyCodeInput): Promise<{ ok: boolean; error?: string }> {
  const id = nextId();
  const result = await store.create({ id, ...input });
  return result !== null ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}
export async function updateKeyCodeEntry(id: string, input: KeyCodeInput): Promise<{ ok: boolean; error?: string }> {
  const ok = await store.update(id, input);
  return ok ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}
export function deleteKeyCodeEntry(id: string) {
  void store.remove(id);
}
