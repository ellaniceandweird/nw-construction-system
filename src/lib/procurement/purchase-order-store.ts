"use client";

import { MOCK_PURCHASE_ORDERS } from "@/lib/data/mock/purchase-orders";
import type { PurchaseOrder, PurchaseOrderStatus } from "@/types/procurement";

const STORAGE_KEY = "project-nw:purchase-orders";

type Listener = () => void;

let orders: PurchaseOrder[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): PurchaseOrder[] {
  if (typeof window === "undefined") return MOCK_PURCHASE_ORDERS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return MOCK_PURCHASE_ORDERS;
    return JSON.parse(raw) as PurchaseOrder[];
  } catch {
    return MOCK_PURCHASE_ORDERS;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function emit() {
  listeners.forEach((l) => l());
}

export function subscribePurchaseOrders(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPurchaseOrdersSnapshot(): PurchaseOrder[] {
  return orders;
}

export interface PurchaseOrderEditInput {
  poStatus: PurchaseOrderStatus;
  expectedDelivery?: string;
  notes?: string;
}

export function updatePurchaseOrder(id: string, input: PurchaseOrderEditInput) {
  orders = orders.map((o) =>
    o.id === id
      ? {
          ...o,
          ...input,
          lastModifiedDate: new Date().toISOString(),
        }
      : o
  );
  persist();
  emit();
}
