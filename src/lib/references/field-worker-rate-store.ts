"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_FIELD_WORKER_RATES } from "@/lib/data/mock/field-worker-rates";
import type { FieldWorkerRate } from "@/types/references";

function fromRow(row: Record<string, any>): FieldWorkerRate {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    trade: row.trade,
    hourlyRate: Number(row.hourly_rate),
    overtimeRate: row.overtime_rate != null ? Number(row.overtime_rate) : undefined,
    defaultCostCode: row.default_cost_code ?? undefined,
    notes: row.notes ?? undefined,
    createdBy: row.created_by ?? "system",
    createdDate: row.created_date ?? new Date().toISOString(),
    lastModifiedBy: row.last_modified_by ?? "system",
    lastModifiedDate: row.last_modified_date ?? new Date().toISOString(),
    revisionNumber: row.revision_number ?? 1,
    module: "References",
    status: row.status ?? "active",
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.employeeId !== undefined) row.employee_id = input.employeeId;
  if (input.employeeName !== undefined) row.employee_name = input.employeeName;
  if (input.trade !== undefined) row.trade = input.trade;
  if (input.hourlyRate !== undefined) row.hourly_rate = input.hourlyRate;
  if (input.overtimeRate !== undefined) row.overtime_rate = input.overtimeRate;
  if (input.defaultCostCode !== undefined) row.default_cost_code = input.defaultCostCode;
  if (input.notes !== undefined) row.notes = input.notes;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<FieldWorkerRate>({
  table: "field_worker_rates",
  seedData: MOCK_FIELD_WORKER_RATES,
  fromRow,
  toRow,
  orderBy: "employee_name",
});

export const subscribeFieldWorkerRates = store.subscribe;
export const getFieldWorkerRatesSnapshot = store.getSnapshot;

export function findRateForEmployee(employeeId: string): FieldWorkerRate | undefined {
  return store.getSnapshot().find((r) => r.employeeId === employeeId);
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

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, r) => {
    const n = parseInt(r.id.replace("RATE-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `RATE-${String(maxNum + 1).padStart(6, "0")}`;
}

export function createFieldWorkerRate(input: FieldWorkerRateInput) {
  const id = nextId();
  void store.create({ id, ...input });
  return id;
}
export function updateFieldWorkerRate(id: string, input: FieldWorkerRateInput) {
  void store.update(id, input);
}
export function deleteFieldWorkerRate(id: string) {
  void store.remove(id);
}
