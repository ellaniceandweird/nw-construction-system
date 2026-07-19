"use client";
import { MOCK_COST_TRANSACTIONS } from "@/lib/data/mock/cost-transactions";
import type { CostTransaction } from "@/types/financial";

const STORAGE_KEY = "project-nw:cost-transactions-manual";
type Listener = () => void;
let transactions: CostTransaction[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): CostTransaction[] {
  if (typeof window === "undefined") return MOCK_COST_TRANSACTIONS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return MOCK_COST_TRANSACTIONS;
    return JSON.parse(raw) as CostTransaction[];
  } catch {
    return MOCK_COST_TRANSACTIONS;
  }
}
function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}
function emit() {
  listeners.forEach((l) => l());
}
function nextId(): string {
  const maxNum = transactions.reduce((max, t) => {
    const n = parseInt(t.id.replace("CTX-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `CTX-${String(maxNum + 1).padStart(6, "0")}`;
}

export function subscribeCostTransactions(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function getCostTransactionsSnapshot(): CostTransaction[] {
  return transactions;
}

export interface CostTransactionInput {
  projectId: string;
  costCode: string;
  category: CostTransaction["category"];
  description: string;
  vendorId?: string;
  date: string;
  amount: number;
  referenceNumber?: string;
}

export function createCostTransaction(input: CostTransactionInput) {
  const now = new Date().toISOString();
  const newTx: CostTransaction = {
    id: nextId(),
    createdBy: "user", createdDate: now,
    lastModifiedBy: "user", lastModifiedDate: now,
    revisionNumber: 1, module: "Financial", status: "active",
    sourceModule: "manual",
    ...input,
  };
  transactions = [...transactions, newTx];
  persist();
  emit();
  return newTx;
}
export function deleteCostTransaction(id: string) {
  transactions = transactions.filter((t) => t.id !== id);
  persist();
  emit();
}
