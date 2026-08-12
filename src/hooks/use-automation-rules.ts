"use client";
import { useSyncExternalStore } from "react";
import {
  subscribeAutomationRules,
  getAutomationRulesSnapshot,
  DEFAULT_AUTOMATION_RULES,
} from "@/lib/settings/automation-rules-store";

export function useAutomationRules() {
  return useSyncExternalStore(subscribeAutomationRules, getAutomationRulesSnapshot, () => DEFAULT_AUTOMATION_RULES);
}
