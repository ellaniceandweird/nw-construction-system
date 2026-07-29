"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import type { BaseEntity } from "@/types/common";

export interface ManagementNote extends BaseEntity {
  message: string;
  author: string;
}

const SEED_NOTES: ManagementNote[] = [
  {
    id: "NOTE-000001",
    createdBy: "system",
    createdDate: "2026-07-10T00:00:00.000Z",
    lastModifiedBy: "system",
    lastModifiedDate: "2026-07-10T00:00:00.000Z",
    revisionNumber: 1,
    module: "Dashboard",
    status: "active",
    message: "Focus on getting the roofing project back on track.",
    author: "Ben",
  },
];

function fromRow(row: Record<string, any>): ManagementNote {
  return {
    id: row.id,
    message: row.message,
    author: row.author,
    createdBy: row.created_by ?? "system",
    createdDate: row.created_date ?? new Date().toISOString(),
    lastModifiedBy: row.last_modified_by ?? "system",
    lastModifiedDate: row.last_modified_date ?? new Date().toISOString(),
    revisionNumber: row.revision_number ?? 1,
    module: "Dashboard",
    status: row.status ?? "active",
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.message !== undefined) row.message = input.message;
  if (input.author !== undefined) row.author = input.author;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<ManagementNote>({
  table: "management_notes",
  seedData: SEED_NOTES,
  fromRow,
  toRow,
  orderBy: "created_date",
});

export const subscribeNotes = store.subscribe;
export const getNotesSnapshot = store.getSnapshot;

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, n) => {
    const num = parseInt(n.id.replace("NOTE-", ""), 10);
    return Number.isFinite(num) ? Math.max(max, num) : max;
  }, 0);
  return `NOTE-${String(maxNum + 1).padStart(6, "0")}`;
}

export async function addNote(message: string, author: string): Promise<{ ok: boolean; error?: string }> {
  const id = nextId();
  const result = await store.create({ id, message, author });
  return result !== null ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}

export function deleteNote(id: string) {
  void store.remove(id);
}
