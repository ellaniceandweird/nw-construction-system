"use client";

const STORAGE_KEY = "project-nw:maintenance-log";

export interface MaintenanceLogEntry {
  id: string;
  timestamp: string; // ISO
  type: "task_completed" | "equipment_serviced";
  propertyName?: string;
  description: string;
  detail?: string; // e.g. "Marked complete" or "Last completed date updated to Jul 10, 2026"
}

type Listener = () => void;

let entries: MaintenanceLogEntry[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): MaintenanceLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MaintenanceLogEntry[];
  } catch {
    return [];
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeMaintenanceLog(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMaintenanceLogSnapshot(): MaintenanceLogEntry[] {
  return entries;
}

/** Called automatically by the task/equipment stores — not meant to be called directly from UI. */
export function addMaintenanceLogEntry(entry: Omit<MaintenanceLogEntry, "id" | "timestamp">) {
  entries = [
    {
      id: `LOG-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    },
    ...entries,
  ];
  persist();
  emit();
}
