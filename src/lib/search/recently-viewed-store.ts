"use client";

export interface RecentlyViewedItem {
  title: string;
  href: string;
  category: string;
  viewedAt: string;
}

const STORAGE_KEY = "project-nw:recently-viewed";
const MAX_ITEMS = 8;
type Listener = () => void;

let items: RecentlyViewedItem[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentlyViewedItem[];
  } catch {
    return [];
  }
}
function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
function emit() {
  listeners.forEach((l) => l());
}

export function subscribeRecentlyViewed(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function getRecentlyViewedSnapshot(): RecentlyViewedItem[] {
  return items;
}

/** Records a page/record as viewed, moving it to the front and capping the list at 8. */
export function recordRecentlyViewed(entry: { title: string; href: string; category: string }) {
  const now = new Date().toISOString();
  items = [
    { ...entry, viewedAt: now },
    ...items.filter((i) => i.href !== entry.href),
  ].slice(0, MAX_ITEMS);
  persist();
  emit();
}
