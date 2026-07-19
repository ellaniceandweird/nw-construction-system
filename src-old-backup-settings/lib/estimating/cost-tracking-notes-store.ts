"use client";

/**
 * Manual notes for the Cost Tracking tab, keyed by estimate ID. These are
 * free-text updates someone types in ("waiting on final invoice from
 * roofer", "client approved change order #2", etc.) — separate from the
 * Estimate's own notes field since this is specifically for tracking
 * budget-vs-actual progress over time, not the original estimate scope.
 */
const STORAGE_KEY = "project-nw:cost-tracking-notes";

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

export function subscribeCostTrackingNotes(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCostTrackingNotesSnapshot(): NotesMap {
  return notes;
}

export function setCostTrackingNote(estimateId: string, note: string) {
  notes = { ...notes, [estimateId]: note };
  persist();
  emit();
}
