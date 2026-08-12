"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import type { AlarmVerbalPasscode } from "@/types/alarm-verbal-passcode";

const SEED_DATA: AlarmVerbalPasscode[] = [];

function fromRow(row: Record<string, any>): AlarmVerbalPasscode {
  return {
    id: row.id,
    propertyId: row.property_id ?? undefined,
    propertyName: row.property_name,
    verbalPasscode: row.verbal_passcode,
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
  if (input.verbalPasscode !== undefined) row.verbal_passcode = input.verbalPasscode;
  if (input.notes !== undefined) row.notes = input.notes;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<AlarmVerbalPasscode>({
  table: "alarm_verbal_passcodes",
  seedData: SEED_DATA,
  fromRow,
  toRow,
  orderBy: "property_name",
});

export const subscribeAlarmVerbalPasscodes = store.subscribe;
export const getAlarmVerbalPasscodesSnapshot = store.getSnapshot;

export interface AlarmVerbalPasscodeInput {
  propertyId?: string;
  propertyName: string;
  verbalPasscode: string;
  notes?: string;
}

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, a) => {
    const n = parseInt(a.id.replace("AVP-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `AVP-${String(maxNum + 1).padStart(6, "0")}`;
}

export async function createAlarmVerbalPasscode(input: AlarmVerbalPasscodeInput): Promise<{ ok: boolean; error?: string }> {
  const id = nextId();
  const result = await store.create({ id, ...input });
  return result !== null ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}

export async function updateAlarmVerbalPasscode(id: string, input: AlarmVerbalPasscodeInput): Promise<{ ok: boolean; error?: string }> {
  const ok = await store.update(id, input);
  return ok ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}

export function deleteAlarmVerbalPasscode(id: string) {
  void store.remove(id);
}
