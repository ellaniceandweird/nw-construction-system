"use client";

import { MOCK_PURCHASE_ORDERS } from "@/lib/data/mock/purchase-orders";
import type { PurchaseOrder, PurchaseOrderLineItem, PurchaseOrderStatus } from "@/types/procurement";

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
  projectId: string;
  vendorId: string;
  orderDate: string;
  expectedDelivery?: string;
  buyer?: string;
  terms?: string;
  poStatus: PurchaseOrderStatus;
  tax?: number;
  freight?: number;
  notes?: string;
  lineItems: PurchaseOrderLineItem[];
}

export function computeTotal(input: Pick<PurchaseOrderEditInput, "lineItems" | "tax" | "freight">): number {
  const lineTotal = input.lineItems.reduce((sum, li) => sum + li.extendedPrice, 0);
  return lineTotal + (input.tax ?? 0) + (input.freight ?? 0);
}

export function updatePurchaseOrder(id: string, input: PurchaseOrderEditInput) {
  const total = computeTotal(input);
  orders = orders.map((o) =>
    o.id === id
      ? {
          ...o,
          ...input,
          total,
          lastModifiedDate: new Date().toISOString(),
        }
      : o
  );
  persist();
  emit();
}
