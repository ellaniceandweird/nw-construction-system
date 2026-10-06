"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";

export interface MaintenanceLogEntry {
  id: string;
  timestamp: string; // ISO
  type: "task_completed" | "equipment_serviced" | "staff_report";
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

export interface StaffReportLogInput {
  /** yyyy-mm-dd — the day the work was done (not the day it was imported). */
  date: string;
  propertyName: string;
  description: string;
  staffName?: string;
  notes?: string;
}

function staffReportKey(date: string, propertyName: string | undefined, description: string) {
  return `${date}|${(propertyName ?? "").trim().toLowerCase()}|${description.trim().toLowerCase()}`;
}

/**
 * Logs work from an imported staff report. Each entry is stamped with
 * the date the work was actually done (noon UTC, so the calendar day
 * can't shift when viewed in New York time), and an entry matching an
 * existing staff-report entry on date + property + description is
 * skipped — so importing the same report twice, or an updated version
 * of it, never creates duplicates.
 */
export async function addStaffReportLogEntries(
  inputs: StaffReportLogInput[]
): Promise<{ added: number; skipped: number; failed: { row: number; error?: string }[] }> {
  const existingKeys = new Set(
    store
      .getSnapshot()
      .filter((e) => e.type === "staff_report")
      .map((e) => staffReportKey(e.timestamp.slice(0, 10), e.propertyName, e.description))
  );

  const failed: { row: number; error?: string }[] = [];
  let added = 0;
  let skipped = 0;
  const base = Date.now();
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const key = staffReportKey(input.date, input.propertyName, input.description);
    if (existingKeys.has(key)) {
      skipped++;
      continue;
    }
    existingKeys.add(key);
    const detailParts = [input.staffName ? `Completed by ${input.staffName}` : "Staff report", input.notes].filter(Boolean);
    const result = await store.create({
      id: `LOG-${base}-${i}`,
      timestamp: `${input.date}T12:00:00.000Z`,
      type: "staff_report",
      propertyName: input.propertyName || undefined,
      description: input.description,
      detail: detailParts.join(" — "),
    });
    if (result !== null) added++;
    else failed.push({ row: i + 1, error: store.getLastError() ?? undefined });
  }
  return { added, skipped, failed };
}
