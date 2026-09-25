"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_EQUIPMENT_MAINTENANCE } from "@/lib/data/mock/maintenance-equipment";
import { addMaintenanceLogEntry } from "@/lib/maintenance/maintenance-log-store";
import type { EquipmentMaintenanceSchedule } from "@/types/maintenance";

function fromRow(row: Record<string, any>): EquipmentMaintenanceSchedule {
  return {
    id: row.id,
    propertyId: row.property_id ?? undefined,
    propertyName: row.property_name,
    location: row.location,
    systemType: row.system_type,
    maintenanceNeeded: row.maintenance_needed ?? undefined,
    frequency: row.frequency ?? undefined,
    lastCompleted: row.last_completed ?? undefined,
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
  if (input.propertyName !== undefined) row.property_name = input.propertyName;
  if (input.location !== undefined) row.location = input.location;
  if (input.systemType !== undefined) row.system_type = input.systemType;
  if (input.maintenanceNeeded !== undefined) row.maintenance_needed = input.maintenanceNeeded;
  if (input.frequency !== undefined) row.frequency = input.frequency;
  if (input.lastCompleted !== undefined) row.last_completed = input.lastCompleted;
  if (input.notes !== undefined) row.notes = input.notes;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<EquipmentMaintenanceSchedule>({
  table: "equipment_maintenance",
  seedData: MOCK_EQUIPMENT_MAINTENANCE,
  fromRow,
  toRow,
  orderBy: "property_name",
});

export const subscribeEquipmentMaintenance = store.subscribe;
export const getEquipmentMaintenanceSnapshot = store.getSnapshot;

export interface EquipmentMaintenanceEditInput {
  propertyName: string;
  location: string;
  systemType: string;
  maintenanceNeeded?: string;
  frequency?: string;
  lastCompleted?: string;
  notes?: string;
}

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, r) => {
    const n = parseInt(r.id.replace("EQ-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `EQ-${String(maxNum + 1).padStart(6, "0")}`;
}

export async function createEquipmentMaintenance(input: EquipmentMaintenanceEditInput): Promise<{ ok: boolean; error?: string }> {
  const id = nextId();
  const result = await store.create({ id, ...input });
  return result !== null ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}

/**
 * Adds many equipment maintenance schedules at once (bulk paste / import).
 * IDs are computed once upfront and incremented locally in this loop,
 * avoiding the same collision risk a tight loop of nextId() calls would
 * have.
 */
/**
 * Imports many equipment maintenance schedules at once, matching each
 * incoming row against existing ones by Property + Location + System
 * Type (case-insensitive) so re-importing an updated Google Sheet
 * supersedes the matching existing row instead of creating a
 * duplicate. Rows that don't match anything existing are added as new.
 */
export async function createEquipmentMaintenanceBulk(inputs: EquipmentMaintenanceEditInput[]): Promise<{ added: number; updated: number; failed: { row: number; error?: string }[] }> {
  const items = store.getSnapshot();
  let maxNum = items.reduce((max, r) => {
    const n = parseInt(r.id.replace("EQ-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);

  function matchKey(propertyName: string, location: string, systemType: string) {
    return `${propertyName.trim().toLowerCase()}|${location.trim().toLowerCase()}|${systemType.trim().toLowerCase()}`;
  }
  const existingByKey = new Map(items.map((r) => [matchKey(r.propertyName, r.location, r.systemType), r]));

  const failed: { row: number; error?: string }[] = [];
  let added = 0;
  let updated = 0;
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const existing = existingByKey.get(matchKey(input.propertyName, input.location, input.systemType));
    if (existing) {
      const result = await store.update(existing.id, input);
      if (result) {
        updated++;
        // Only log when the completed date actually moved — re-importing
        // the same sheet with an unchanged date shouldn't spam the log.
        if (input.lastCompleted && input.lastCompleted !== existing.lastCompleted) {
          addMaintenanceLogEntry({
            type: "equipment_serviced",
            propertyName: input.propertyName,
            description: `${input.systemType} — ${input.location}`,
            detail: `Last completed date updated to ${new Date(input.lastCompleted).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} (import)`,
          });
        }
      } else {
        failed.push({ row: i + 1, error: store.getLastError() ?? undefined });
      }
      continue;
    }
    maxNum += 1;
    const id = `EQ-${String(maxNum).padStart(6, "0")}`;
    const result = await store.create({ id, ...input });
    if (result !== null) {
      added++;
      if (input.lastCompleted) {
        addMaintenanceLogEntry({
          type: "equipment_serviced",
          propertyName: input.propertyName,
          description: `${input.systemType} — ${input.location}`,
          detail: `Last completed date updated to ${new Date(input.lastCompleted).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} (import)`,
        });
      }
    } else {
      failed.push({ row: i + 1, error: store.getLastError() ?? undefined });
    }
  }
  return { added, updated, failed };
}

export async function updateEquipmentMaintenance(id: string, input: EquipmentMaintenanceEditInput): Promise<{ ok: boolean; error?: string }> {
  const existing = store.getSnapshot().find((r) => r.id === id);
  const ok = await store.update(id, input);
  if (!ok) return { ok: false, error: store.getLastError() ?? undefined };
  if (existing && input.lastCompleted && input.lastCompleted !== existing.lastCompleted) {
    const formattedDate = new Date(input.lastCompleted).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    addMaintenanceLogEntry({
      type: "equipment_serviced",
      propertyName: input.propertyName,
      description: `${input.systemType} — ${input.location}`,
      detail: `Last completed date updated to ${formattedDate}`,
    });
  }
  return { ok: true };
}

export function deleteEquipmentMaintenance(id: string) {
  void store.remove(id);
}
