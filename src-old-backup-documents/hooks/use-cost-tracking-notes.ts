"use client";

import { useSyncExternalStore } from "react";

import { subscribeCostTrackingNotes, getCostTrackingNotesSnapshot } from "@/lib/estimating/cost-tracking-notes-store";

export function useCostTrackingNotes(): Record<string, string> {
  return useSyncExternalStore(
    subscribeCostTrackingNotes,
    getCostTrackingNotesSnapshot,
    () => ({}) as Record<string, string>
  );
}
