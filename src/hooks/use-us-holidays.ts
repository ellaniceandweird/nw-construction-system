"use client";
import { useSyncExternalStore } from "react";
import { subscribeUSHolidays, getUSHolidaysSnapshot } from "@/lib/references/us-holiday-store";
import { MOCK_US_HOLIDAYS } from "@/lib/data/mock/us-holidays";
export function useUSHolidays() {
  return useSyncExternalStore(subscribeUSHolidays, getUSHolidaysSnapshot, () => MOCK_US_HOLIDAYS);
}
