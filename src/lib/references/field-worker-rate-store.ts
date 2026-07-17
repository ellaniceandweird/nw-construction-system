"use client";
import { MOCK_FIELD_WORKER_RATES } from "@/lib/data/mock/field-worker-rates";
import type { FieldWorkerRate } from "@/types/references";

const STORAGE_KEY = "project-nw:field-worker-rates";
type Listener = () => void;
let rates: FieldWorkerRate[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): FieldWorkerRate[] {
  if (typeof window === "undefined") return MOCK_FIELD_WORKER_RATES;
  try { const raw = window.localStorage.getItem(STORAGE_KEY); if (!raw) return MOCK_FIELD_WORKER_RATES; return JSON.parse(raw) as FieldWorkerRate[]; } catch { return MOCK_FIELD_WORKER_RATES; }
}
function persist() { if (typeof window === "undefined") return; window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rates)); }
function emit() { listeners.forEach((l) => l()); }
function nextId(): string {
  const maxNum = rates.reduce((max, r) => { const n = parseInt(r.id.replace("RATE-", ""), 10); return Number.isFinite(n) ? Math.max(max, n) : max; }, 0);
  return `RATE-${String(maxNum + 1).padStart(6, "0")}`;
}

export function subscribeFieldWorkerRates(listener: Listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function getFieldWorkerRatesSnapshot(): FieldWorkerRate[] { return rates; }
export function findRateForEmployee(employeeId: string): FieldWorkerRate | undefined {
  return rates.find((r) => r.employeeId === employeeId);
}

export interface FieldWorkerRateInput {
  employeeId: string;
  employeeName: string;
  trade: string;
  hourlyRate: number;
  overtimeRate?: number;
  defaultCostCode?: string;
  notes?: string;
}

export function createFieldWorkerRate(input: FieldWorkerRateInput) {
  const now = new Date().toISOString();
  const newRate: FieldWorkerRate = { id: nextId(), createdBy: "user", createdDate: now, lastModifiedBy: "user", lastModifiedDate: now, revisionNumber: 1, module: "References", status: "active", ...input };
  rates = [...rates, newRate];
  persist(); emit();
  return newRate;
}
export function updateFieldWorkerRate(id: string, input: FieldWorkerRateInput) {
  rates = rates.map((r) => r.id === id ? { ...r, ...input, lastModifiedDate: new Date().toISOString() } : r);
  persist(); emit();
}
export function deleteFieldWorkerRate(id: string) {
  rates = rates.filter((r) => r.id !== id);
  persist(); emit();
}
