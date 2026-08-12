"use client";

import { useSyncExternalStore } from "react";

import { subscribeDailyLogs, getDailyLogsSnapshot } from "@/lib/field-operations/daily-log-store";
import { MOCK_DAILY_LOGS } from "@/lib/data/mock/daily-logs";

export function useDailyLogs() {
  return useSyncExternalStore(
    subscribeDailyLogs,
    getDailyLogsSnapshot,
    () => MOCK_DAILY_LOGS
  );
}
