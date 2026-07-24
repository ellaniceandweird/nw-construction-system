"use client";
import { useSyncExternalStore } from "react";
import { subscribeTakeoffItems, getTakeoffItemsSnapshot } from "@/lib/estimating/takeoff-store";
import { MOCK_TAKEOFF_ITEMS } from "@/lib/data/mock/takeoff-items";
export function useTakeoffItems() {
  return useSyncExternalStore(subscribeTakeoffItems, getTakeoffItemsSnapshot, () => MOCK_TAKEOFF_ITEMS);
}
