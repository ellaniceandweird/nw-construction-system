"use client";

import { useSyncExternalStore } from "react";

import {
  subscribeMaintenanceLog,
  getMaintenanceLogSnapshot,
} from "@/lib/maintenance/maintenance-log-store";

export function useMaintenanceLog() {
  return useSyncExternalStore(subscribeMaintenanceLog, getMaintenanceLogSnapshot, () => []);
}
