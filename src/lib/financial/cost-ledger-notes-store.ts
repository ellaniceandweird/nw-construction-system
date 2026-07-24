"use client";

/** Manual notes on Cost Ledger rows (both PO-derived and manual entries), keyed by transaction ID. */
const STORAGE_KEY = "project-nw:cost-ledger-notes";

type Listener = () => void;
type NotesMap = Record<string, string>;

let notes: NotesMap = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): NotesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as NotesMap;
  } catch {
    return {};
  }
}
function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}
function emit() {
  listeners.forEach((l) => l());
}

export function subscribeCostLedgerNotes(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function getCostLedgerNotesSnapshot(): NotesMap {
  return notes;
}
export function setCostLedgerNote(transactionId: string, note: string) {
  notes = { ...notes, [transactionId]: note };
  persist();
  emit();
}
