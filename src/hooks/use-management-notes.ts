"use client";
import { useSyncExternalStore } from "react";
import { subscribeNotes, getNotesSnapshot } from "@/lib/dashboard/notes-store";

export function useManagementNotes() {
  return useSyncExternalStore(subscribeNotes, getNotesSnapshot, () => []);
}
