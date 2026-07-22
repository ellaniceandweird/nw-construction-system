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
  billingEntityId: string;
  orderDate: string;
  expectedDelivery?: string;
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

function nextPoNumber(): string {
  const nums = orders
    .map((o) => parseInt(o.poNumber.replace(/\D/g, ""), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `PO-${(max + 1).toString().padStart(5, "0")}`;
}

/** Manual entry — always available even though most POs auto-generate from awarded quotes. */
export function createPurchaseOrder(input: PurchaseOrderEditInput) {
  const now = new Date().toISOString();
  const poNumber = nextPoNumber();
  const total = computeTotal(input);
  const newOrder: PurchaseOrder = {
    id: poNumber,
    createdBy: "current-user",
    createdDate: now,
    lastModifiedBy: "current-user",
    lastModifiedDate: now,
    revisionNumber: 1,
    module: "Procurement",
    status: "active",
    poNumber,
    currency: "USD",
    total,
    ...input,
  };
  orders = [...orders, newOrder];
  persist();
  emit();
  return newOrder.id;
}

export interface AutoGenerateFromQuoteInput {
  rfqId: string;
  projectId: string;
  vendorId: string;
  billingEntityId: string;
  materialList: string;
  quotedPrice: number;
  freight?: number;
  tax?: number;
  leadTimeDays: number;
}

/**
 * Auto-generates a Purchase Order the moment a quote is marked Awarded —
 * per Ben and Sjaak's request, so nobody has to manually re-key an
 * already-approved quote into a PO. Skips creating a duplicate if one
 * already exists for this RFQ (e.g. re-awarding after a change).
 */
export function createPurchaseOrderFromQuote(input: AutoGenerateFromQuoteInput) {
  const existing = orders.find((o) => o.sourceRfqId === input.rfqId);
  if (existing) return existing.id;

  const now = new Date().toISOString();
  const poNumber = nextPoNumber();
  const lineItems: PurchaseOrderLineItem[] = [
    {
      description: input.materialList,
      quantity: 1,
      unit: "lot",
      unitPrice: input.quotedPrice,
      extendedPrice: input.quotedPrice,
    },
  ];
  const total = input.quotedPrice + (input.freight ?? 0) + (input.tax ?? 0);
  const expectedDelivery = new Date(Date.now() + input.leadTimeDays * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const newOrder: PurchaseOrder = {
    id: poNumber,
    createdBy: "current-user",
    createdDate: now,
    lastModifiedBy: "current-user",
    lastModifiedDate: now,
    revisionNumber: 1,
    module: "Procurement",
    status: "active",
    projectId: input.projectId,
    poNumber,
    vendorId: input.vendorId,
    billingEntityId: input.billingEntityId,
    orderDate: now.slice(0, 10),
    expectedDelivery,
    poStatus: "approved",
    currency: "USD",
    tax: input.tax,
    freight: input.freight,
    total,
    lineItems,
    sourceRfqId: input.rfqId,
  };
  orders = [...orders, newOrder];
  persist();
  emit();
  return newOrder.id;
}
