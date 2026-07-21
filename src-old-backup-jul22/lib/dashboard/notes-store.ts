"use client";

export interface ManagementNote {
  id: string;
  message: string;
  author: string;
  createdDate: string;
}

const STORAGE_KEY = "project-nw:management-notes";
type Listener = () => void;

const SEED_NOTES: ManagementNote[] = [
  {
    id: "NOTE-000001",
    message: "Focus on getting the roofing project back on track.",
    author: "Ben",
    createdDate: "2026-07-10T00:00:00.000Z",
  },
];

let notes: ManagementNote[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): ManagementNote[] {
  if (typeof window === "undefined") return SEED_NOTES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_NOTES;
    return JSON.parse(raw) as ManagementNote[];
  } catch {
    return SEED_NOTES;
  }
}
function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}
function emit() {
  listeners.forEach((l) => l());
}
function nextId(): string {
  const maxNum = notes.reduce((max, n) => {
    const num = parseInt(n.id.replace("NOTE-", ""), 10);
    return Number.isFinite(num) ? Math.max(max, num) : max;
  }, 0);
  return `NOTE-${String(maxNum + 1).padStart(6, "0")}`;
}

export function subscribeNotes(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function getNotesSnapshot(): ManagementNote[] {
  return notes;
}
export function addNote(message: string, author: string) {
  const newNote: ManagementNote = {
    id: nextId(),
    message,
    author,
    createdDate: new Date().toISOString(),
  };
  notes = [newNote, ...notes];
  persist();
  emit();
  return newNote;
}
export function deleteNote(id: string) {
  notes = notes.filter((n) => n.id !== id);
  persist();
  emit();
}
