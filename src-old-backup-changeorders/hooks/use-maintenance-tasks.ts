"use client";

import { useSyncExternalStore } from "react";

import {
  subscribeMaintenanceTasks,
  getMaintenanceTasksSnapshot,
} from "@/lib/maintenance/maintenance-task-store";
import { MOCK_MAINTENANCE_TASKS } from "@/lib/data/mock/maintenance-tasks";

export function useMaintenanceTasks() {
  return useSyncExternalStore(
    subscribeMaintenanceTasks,
    getMaintenanceTasksSnapshot,
    () => MOCK_MAINTENANCE_TASKS
  );
}
