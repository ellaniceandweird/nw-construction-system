"use client";
import { useSyncExternalStore } from "react";
import { subscribeNotes, getNotesSnapshot } from "@/lib/dashboard/notes-store";
import type { ManagementNote } from "@/lib/dashboard/notes-store";

const SEED_NOTES: ManagementNote[] = [
  {
    id: "NOTE-000001",
    message: "Focus on getting the roofing project back on track.",
    author: "Ben",
    createdDate: "2026-07-10T00:00:00.000Z",
  },
];

export function useManagementNotes() {
  return useSyncExternalStore(subscribeNotes, getNotesSnapshot, () => SEED_NOTES);
}
