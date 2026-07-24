"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";

export interface MaintenanceLogEntry {
  id: string;
  timestamp: string; // ISO
  type: "task_completed" | "equipment_serviced";
  propertyName?: string;
  description: string;
  detail?: string; // e.g. "Marked complete" or "Last completed date updated to Jul 10, 2026"
}

function fromRow(row: Record<string, any>): MaintenanceLogEntry {
  return {
    id: row.id,
    timestamp: row.timestamp,
    type: row.type,
    propertyName: row.property_name ?? undefined,
    description: row.description,
    detail: row.detail ?? undefined,
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.timestamp !== undefined) row.timestamp = input.timestamp;
  if (input.type !== undefined) row.type = input.type;
  if (input.propertyName !== undefined) row.property_name = input.propertyName;
  if (input.description !== undefined) row.description = input.description;
  if (input.detail !== undefined) row.detail = input.detail;
  return row;
}

const store = createCollectionStore<MaintenanceLogEntry>({
  table: "maintenance_log",
  seedData: [],
  fromRow,
  toRow,
  orderBy: "timestamp",
});

export const subscribeMaintenanceLog = store.subscribe;
export const getMaintenanceLogSnapshot = store.getSnapshot;

/** Called automatically by the task/equipment stores — not meant to be called directly from UI. */
export function addMaintenanceLogEntry(entry: Omit<MaintenanceLogEntry, "id" | "timestamp">) {
  const id = `LOG-${Date.now()}-${Math.round(Math.random() * 1000)}`;
  void store.create({ id, timestamp: new Date().toISOString(), ...entry });
}
