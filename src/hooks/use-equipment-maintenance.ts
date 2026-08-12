"use client";

import { useSyncExternalStore } from "react";

import {
  subscribeEquipmentMaintenance,
  getEquipmentMaintenanceSnapshot,
} from "@/lib/maintenance/equipment-maintenance-store";
import { MOCK_EQUIPMENT_MAINTENANCE } from "@/lib/data/mock/maintenance-equipment";

export function useEquipmentMaintenance() {
  return useSyncExternalStore(
    subscribeEquipmentMaintenance,
    getEquipmentMaintenanceSnapshot,
    () => MOCK_EQUIPMENT_MAINTENANCE
  );
}
