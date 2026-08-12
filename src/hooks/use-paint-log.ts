"use client";
import { useSyncExternalStore } from "react";
import { subscribePaintLog, getPaintLogSnapshot } from "@/lib/maintenance/paint-log-store";

export function usePaintLog() {
  return useSyncExternalStore(subscribePaintLog, getPaintLogSnapshot, () => []);
}
