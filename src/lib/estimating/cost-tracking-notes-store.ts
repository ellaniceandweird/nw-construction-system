"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";

/**
 * Manual notes for the Cost Tracking tab, keyed by estimate ID. These are
 * free-text updates someone types in ("waiting on final invoice from
 * roofer", "client approved change order #2", etc.) — separate from the
 * Estimate's own notes field since this is specifically for tracking
 * budget-vs-actual progress over time, not the original estimate scope.
 */

interface CostTrackingNoteRow {
  id: string; // the estimate id this note belongs to
  note: string;
}

function fromRow(row: Record<string, any>): CostTrackingNoteRow {
  return { id: row.id, note: row.note ?? "" };
}
function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.note !== undefined) row.note = input.note;
  return row;
}

const store = createCollectionStore<CostTrackingNoteRow>({
  table: "cost_tracking_notes",
  seedData: [],
  fromRow,
  toRow,
  orderBy: "id",
});

type Listener = () => void;
type NotesMap = Record<string, string>;

let cachedMap: NotesMap = {};
let cachedFromItems: CostTrackingNoteRow[] | null = null;

function getMap(): NotesMap {
  const items = store.getSnapshot();
  if (items !== cachedFromItems) {
    cachedFromItems = items;
    cachedMap = Object.fromEntries(items.map((i) => [i.id, i.note]));
  }
  return cachedMap;
}

export function subscribeCostTrackingNotes(listener: Listener) {
  return store.subscribe(listener);
}
export function getCostTrackingNotesSnapshot(): NotesMap {
  return getMap();
}

export async function setCostTrackingNote(estimateId: string, note: string): Promise<{ ok: boolean; error?: string }> {
  const existing = store.getSnapshot().find((i) => i.id === estimateId);
  if (existing) {
    const ok = await store.update(estimateId, { note });
    return ok ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
  }
  const result = await store.create({ id: estimateId, note });
  return result !== null ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}
