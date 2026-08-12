"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";

interface CostLedgerNoteRow {
  id: string; // the transaction id this note belongs to
  note: string;
}

function fromRow(row: Record<string, any>): CostLedgerNoteRow {
  return { id: row.id, note: row.note ?? "" };
}
function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.note !== undefined) row.note = input.note;
  return row;
}

const store = createCollectionStore<CostLedgerNoteRow>({
  table: "cost_ledger_notes",
  seedData: [],
  fromRow,
  toRow,
  orderBy: "id",
});

type Listener = () => void;
type NotesMap = Record<string, string>;

// Keeps the same "map of transactionId -> note" shape the Cost Ledger
// table already expects, so no consuming component needs to change —
// just the persistence underneath moved from localStorage to the real
// shared database.
let cachedMap: NotesMap = {};
let cachedFromItems: CostLedgerNoteRow[] | null = null;

function getMap(): NotesMap {
  const items = store.getSnapshot();
  if (items !== cachedFromItems) {
    cachedFromItems = items;
    cachedMap = Object.fromEntries(items.map((i) => [i.id, i.note]));
  }
  return cachedMap;
}

export function subscribeCostLedgerNotes(listener: Listener) {
  return store.subscribe(listener);
}
export function getCostLedgerNotesSnapshot(): NotesMap {
  return getMap();
}

export async function setCostLedgerNote(transactionId: string, note: string): Promise<{ ok: boolean; error?: string }> {
  const existing = store.getSnapshot().find((i) => i.id === transactionId);
  if (existing) {
    const ok = await store.update(transactionId, { note });
    return ok ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
  }
  const result = await store.create({ id: transactionId, note });
  return result !== null ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}
