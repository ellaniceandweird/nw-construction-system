"use client";
import { useSyncExternalStore } from "react";
import { subscribeDrawings, getDrawingsSnapshot } from "@/lib/documents/drawing-store";
import { MOCK_DRAWINGS } from "@/lib/data/mock/drawings";
export function useDrawings() {
  return useSyncExternalStore(subscribeDrawings, getDrawingsSnapshot, () => MOCK_DRAWINGS);
}
