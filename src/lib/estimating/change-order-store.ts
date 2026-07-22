"use client";

import { MOCK_CHANGE_ORDERS } from "@/lib/data/mock/change-orders";
import type { ChangeOrder, ChangeOrderStatus } from "@/types/change-orders";

const STORAGE_KEY = "project-nw:change-orders";
type Listener = () => void;
let changeOrders: ChangeOrder[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): ChangeOrder[] {
  if (typeof window === "undefined") return MOCK_CHANGE_ORDERS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return MOCK_CHANGE_ORDERS;
    return JSON.parse(raw) as ChangeOrder[];
  } catch {
    return MOCK_CHANGE_ORDERS;
  }
}
function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(changeOrders));
}
function emit() {
  listeners.forEach((l) => l());
}
function nextNumber(): string {
  const year = new Date().getFullYear();
  return `CO-${year}-${String(changeOrders.length + 1).padStart(4, "0")}`;
}
function nextId(): string {
  const maxNum = changeOrders.reduce((max, c) => {
    const n = parseInt(c.id.replace("CO-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `CO-${String(maxNum + 1).padStart(6, "0")}`;
}

export function subscribeChangeOrders(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function getChangeOrdersSnapshot(): ChangeOrder[] {
  return changeOrders;
}

export interface ChangeOrderInput {
  projectId: string;
  estimateId: string;
  description: string;
  reason?: string;
  costImpact: number;
  scheduleImpactDays?: number;
  relatedItem?: string;
  changeOrderStatus: ChangeOrderStatus;
  requestedBy?: string;
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  notes?: string;
}

export function createChangeOrder(input: ChangeOrderInput) {
  const now = new Date().toISOString();
  const newCO: ChangeOrder = {
    id: nextId(),
    createdBy: "user", createdDate: now,
    lastModifiedBy: "user", lastModifiedDate: now,
    revisionNumber: 1, module: "Estimating", status: "active",
    changeOrderNumber: nextNumber(),
    ...input,
  };
  changeOrders = [...changeOrders, newCO];
  persist();
  emit();
  return newCO;
}

export function updateChangeOrder(id: string, input: ChangeOrderInput) {
  changeOrders = changeOrders.map((c) =>
    c.id === id ? { ...c, ...input, lastModifiedDate: new Date().toISOString() } : c
  );
  persist();
  emit();
}

export function deleteChangeOrder(id: string) {
  changeOrders = changeOrders.filter((c) => c.id !== id);
  persist();
  emit();
}

/** Sum of approved change orders' cost impact for one estimate — the amount added to (or subtracted from) the original budget. */
export function computeApprovedChangesTotal(estimateId: string, allChangeOrders: ChangeOrder[]): number {
  return allChangeOrders
    .filter((c) => c.estimateId === estimateId && c.changeOrderStatus === "approved")
    .reduce((sum, c) => sum + c.costImpact, 0);
}
