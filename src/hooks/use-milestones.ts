"use client";
import { useSyncExternalStore } from "react";
import { subscribeMilestones, getMilestonesSnapshot } from "@/lib/projects/milestone-store";
import { MOCK_MILESTONES } from "@/lib/data/mock/milestones";

export function useMilestones() {
  return useSyncExternalStore(subscribeMilestones, getMilestonesSnapshot, () => MOCK_MILESTONES);
}
