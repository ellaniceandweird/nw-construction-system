"use client";
import { useSyncExternalStore } from "react";
import { subscribeAlarmVerbalPasscodes, getAlarmVerbalPasscodesSnapshot } from "@/lib/maintenance/alarm-verbal-passcode-store";

export function useAlarmVerbalPasscodes() {
  return useSyncExternalStore(subscribeAlarmVerbalPasscodes, getAlarmVerbalPasscodesSnapshot, () => []);
}
