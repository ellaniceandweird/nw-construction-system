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

export function createEquipmentMaintenance(input: EquipmentMaintenanceEditInput) {
  const id = nextId();
  void store.create({ id, ...input });
  return id;
}

export function updateEquipmentMaintenance(id: string, input: EquipmentMaintenanceEditInput) {
  const existing = store.getSnapshot().find((r) => r.id === id);
  void store.update(id, input);
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
}
