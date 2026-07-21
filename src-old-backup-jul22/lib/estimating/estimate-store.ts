"use client";

import { MOCK_ESTIMATES } from "@/lib/data/mock/estimates";
import { computeLineItemTotal, computeEstimateTotal } from "@/lib/estimating/estimate-calculations";
import type { Estimate, EstimateLineItem, EstimateStatus } from "@/types/estimating";

const STORAGE_KEY = "project-nw:estimates";
type Listener = () => void;
let estimates: Estimate[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): Estimate[] {
  if (typeof window === "undefined") return MOCK_ESTIMATES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return MOCK_ESTIMATES;
    return JSON.parse(raw) as Estimate[];
  } catch {
    return MOCK_ESTIMATES;
  }
}
function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(estimates));
}
function emit() {
  listeners.forEach((l) => l());
}
function nextEstimateNumber(): string {
  const year = new Date().getFullYear();
  return `EST-${year}-${String(estimates.length + 1).padStart(4, "0")}`;
}
function nextId(): string {
  const maxNum = estimates.reduce((max, e) => {
    const n = parseInt(e.id.replace("EST-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `EST-${String(maxNum + 1).padStart(6, "0")}`;
}

export function subscribeEstimates(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function getEstimatesSnapshot(): Estimate[] {
  return estimates;
}
export function withComputedLineItemTotals(
  lineItems: Omit<EstimateLineItem, "totalCost">[]
): EstimateLineItem[] {
  return lineItems.map((li) => ({ ...li, totalCost: computeLineItemTotal(li) }));
}

export interface EstimateEditInput {
  projectId: string;
  client?: string;
  address?: string;
  estimator: string;
  estimateDate: string;
  estimateStatus: EstimateStatus;
  proposalNumber?: string;
  taxMethod?: string;
  notes?: string;
  lineItems: EstimateLineItem[];
  indirectCosts?: Estimate["indirectCosts"];
  contingency?: Estimate["contingency"];
}

export function createEstimate(input: EstimateEditInput) {
  const now = new Date().toISOString();
  const newEstimate: Estimate = {
    id: nextId(),
    createdBy: "user",
    createdDate: now,
    lastModifiedBy: "user",
    lastModifiedDate: now,
    revisionNumber: 1,
    module: "Estimating",
    status: "active",
    estimateNumber: nextEstimateNumber(),
    revision: 1,
    currency: "USD",
    totalEstimatedCost: computeEstimateTotal(input.lineItems, input.indirectCosts, input.contingency),
    ...input,
  };
  estimates = [...estimates, newEstimate];
  persist();
  emit();
  return newEstimate;
}

export function updateEstimate(id: string, input: EstimateEditInput) {
  estimates = estimates.map((e) =>
    e.id === id
      ? {
          ...e,
          ...input,
          revision: e.revision + 1,
          revisionNumber: e.revisionNumber + 1,
          totalEstimatedCost: computeEstimateTotal(input.lineItems, input.indirectCosts, input.contingency),
          lastModifiedDate: new Date().toISOString(),
        }
      : e
  );
  persist();
  emit();
}

export function deleteEstimate(id: string) {
  estimates = estimates.filter((e) => e.id !== id);
  persist();
  emit();
}
