"use client";

import { MOCK_TAKEOFF_ITEMS } from "@/lib/data/mock/takeoff-items";
import type { TakeoffItem } from "@/types/estimating";

const STORAGE_KEY = "project-nw:takeoff-items";
type Listener = () => void;
let items: TakeoffItem[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): TakeoffItem[] {
  if (typeof window === "undefined") return MOCK_TAKEOFF_ITEMS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return MOCK_TAKEOFF_ITEMS;
    return JSON.parse(raw) as TakeoffItem[];
  } catch {
    return MOCK_TAKEOFF_ITEMS;
  }
}
function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
function emit() {
  listeners.forEach((l) => l());
}
function nextId(): string {
  const maxNum = items.reduce((max, t) => {
    const n = parseInt(t.id.replace("TO-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `TO-${String(maxNum + 1).padStart(6, "0")}`;
}
export function subscribeTakeoffItems(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function getTakeoffItemsSnapshot(): TakeoffItem[] {
  return items;
}
function computeAdjusted(quantity: number, wasteFactorPercent?: number) {
  return wasteFactorPercent ? Math.round(quantity * (1 + wasteFactorPercent / 100)) : quantity;
}
export type TakeoffItemInput = Omit<TakeoffItem, "id" | "adjustedQuantity">;

export function createTakeoffItem(input: TakeoffItemInput) {
  const newItem: TakeoffItem = { ...input, id: nextId(), adjustedQuantity: computeAdjusted(input.quantity, input.wasteFactorPercent) };
  items = [...items, newItem];
  persist();
  emit();
  return newItem;
}
export function updateTakeoffItem(id: string, input: TakeoffItemInput) {
  items = items.map((t) => (t.id === id ? { ...t, ...input, adjustedQuantity: computeAdjusted(input.quantity, input.wasteFactorPercent) } : t));
  persist();
  emit();
}
export function deleteTakeoffItem(id: string) {
  items = items.filter((t) => t.id !== id);
  persist();
  emit();
}
