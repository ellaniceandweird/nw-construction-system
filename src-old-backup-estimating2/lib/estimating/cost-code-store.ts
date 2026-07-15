"use client";

import { MOCK_COST_CODES } from "@/lib/data/mock/cost-codes";
import type { CostCode } from "@/types/estimating";

const STORAGE_KEY = "project-nw:cost-codes";

type Listener = () => void;

let costCodes: CostCode[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): CostCode[] {
  if (typeof window === "undefined") return MOCK_COST_CODES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return MOCK_COST_CODES;
    return JSON.parse(raw) as CostCode[];
  } catch {
    return MOCK_COST_CODES;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(costCodes));
}

function emit() {
  listeners.forEach((l) => l());
}

function nextId(): string {
  const maxNum = costCodes.reduce((max, c) => {
    const n = parseInt(c.id.replace("CC-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `CC-${String(maxNum + 1).padStart(6, "0")}`;
}

export function subscribeCostCodes(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCostCodesSnapshot(): CostCode[] {
  return costCodes;
}

export interface CostCodeInput {
  code: string;
  description: string;
  division: string;
  trade?: string;
  category?: string;
}

export function createCostCode(input: CostCodeInput) {
  const now = new Date().toISOString();
  const newCode: CostCode = {
    id: nextId(),
    createdBy: "user",
    createdDate: now,
    lastModifiedBy: "user",
    lastModifiedDate: now,
    revisionNumber: 1,
    module: "Estimating",
    status: "active",
    ...input,
  };
  costCodes = [...costCodes, newCode];
  persist();
  emit();
  return newCode;
}

export function updateCostCode(id: string, input: CostCodeInput) {
  costCodes = costCodes.map((c) =>
    c.id === id ? { ...c, ...input, lastModifiedDate: new Date().toISOString() } : c
  );
  persist();
  emit();
}

export function deleteCostCode(id: string) {
  costCodes = costCodes.filter((c) => c.id !== id);
  persist();
  emit();
}
