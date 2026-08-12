"use client";
import { useSyncExternalStore } from "react";
import { subscribeDailyWorkPlanDetails, getDailyWorkPlanDetailsSnapshot } from "@/lib/scheduling/daily-work-plan-details-store";

export function useDailyWorkPlanDetails() {
  return useSyncExternalStore(subscribeDailyWorkPlanDetails, getDailyWorkPlanDetailsSnapshot, () => []);
}
