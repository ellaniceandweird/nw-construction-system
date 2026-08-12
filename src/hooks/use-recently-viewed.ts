"use client";
import { useSyncExternalStore } from "react";
import { subscribeRecentlyViewed, getRecentlyViewedSnapshot } from "@/lib/search/recently-viewed-store";
import type { RecentlyViewedItem } from "@/lib/search/recently-viewed-store";

const EMPTY: RecentlyViewedItem[] = [];

export function useRecentlyViewed() {
  return useSyncExternalStore(subscribeRecentlyViewed, getRecentlyViewedSnapshot, () => EMPTY);
}
