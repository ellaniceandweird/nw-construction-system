"use client";

import { useSyncExternalStore } from "react";

import { subscribeActivities, getActivitiesSnapshot } from "@/lib/scheduling/activity-store";
import { MOCK_ACTIVITIES } from "@/lib/data/mock/activities";

/**
 * The live Master Schedule. Every scheduling view (Master Schedule,
 * 16-week, 4-week, weekly, daily) should read activities through this
 * hook, not the static MOCK_ACTIVITIES import — that's what makes an
 * edit on the Master Schedule page instantly reflected everywhere else.
 */
export function useActivities() {
  return useSyncExternalStore(
    subscribeActivities,
    getActivitiesSnapshot,
    () => MOCK_ACTIVITIES // server snapshot, before hydration
  );
}
