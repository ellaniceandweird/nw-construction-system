"use client";

import { MOCK_EQUIPMENT_MAINTENANCE } from "@/lib/data/mock/maintenance-equipment";
import type { EquipmentMaintenanceSchedule } from "@/types/maintenance";

const STORAGE_KEY = "project-nw:equipment-maintenance";

type Listener = () => void;

let records: EquipmentMaintenanceSchedule[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): EquipmentMaintenanceSchedule[] {
  if (typeof window === "undefined") return MOCK_EQUIPMENT_MAINTENANCE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return MOCK_EQUIPMENT_MAINTENANCE;
    return JSON.parse(raw) as EquipmentMaintenanceSchedule[];
  } catch {
    return MOCK_EQUIPMENT_MAINTENANCE;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeEquipmentMaintenance(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getEquipmentMaintenanceSnapshot(): EquipmentMaintenanceSchedule[] {
  return records;
}

export interface EquipmentMaintenanceEditInput {
  propertyName: string;
  location: string;
  systemType: string;
  maintenanceNeeded?: string;
  frequency?: string;
  lastCompleted?: string;
  notes?: string;
}

export function updateEquipmentMaintenance(id: string, input: EquipmentMaintenanceEditInput) {
  records = records.map((r) =>
    r.id === id
      ? {
          ...r,
          ...input,
          lastModifiedDate: new Date().toISOString(),
        }
      : r
  );
  persist();
  emit();
}
