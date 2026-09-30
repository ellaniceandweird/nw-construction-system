"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_FIELD_WORKER_RATES } from "@/lib/data/mock/field-worker-rates";
import { getTodayInNewYorkString } from "@/lib/date/today";
import type { FieldWorkerRate } from "@/types/references";

function fromRow(row: Record<string, any>): FieldWorkerRate {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    trade: row.trade,
    hourlyRate: Number(row.hourly_rate),
    overtimeRate: row.overtime_rate != null ? Number(row.overtime_rate) : undefined,
    startDate: row.start_date ?? undefined,
    lastRaiseDate: row.last_raise_date ?? undefined,
    previousRate: row.previous_rate != null ? Number(row.previous_rate) : undefined,
    ptoUsedHours: row.pto_used_hours != null ? Number(row.pto_used_hours) : undefined,
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
  if (input.startDate !== undefined) row.start_date = input.startDate;
  if (input.lastRaiseDate !== undefined) row.last_raise_date = input.lastRaiseDate;
  if (input.previousRate !== undefined) row.previous_rate = input.previousRate;
  if (input.ptoUsedHours !== undefined) row.pto_used_hours = input.ptoUsedHours;
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
  startDate?: string;
  lastRaiseDate?: string;
  previousRate?: number;
  ptoUsedHours?: number;
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

export async function createFieldWorkerRate(input: FieldWorkerRateInput): Promise<{ ok: boolean; error?: string }> {
  const id = nextId();
  const result = await store.create({ id, ...input });
  return result !== null ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}
export async function updateFieldWorkerRate(id: string, input: FieldWorkerRateInput): Promise<{ ok: boolean; error?: string }> {
  const existing = store.getSnapshot().find((r) => r.id === id);
  // Whenever the hourly rate is actually changed to something new,
  // automatically capture the old rate and today's date as the raise
  // history — so this never depends on someone remembering to fill in
  // Previous Rate / Last Raise Date by hand. A manually-set
  // lastRaiseDate/previousRate in the same edit (e.g. correcting
  // historical data) still wins, since the ?? only fills in when they
  // weren't explicitly provided.
  const rateChanged = existing && input.hourlyRate !== existing.hourlyRate;
  const finalInput = rateChanged
    ? {
        ...input,
        previousRate: input.previousRate ?? existing.hourlyRate,
        lastRaiseDate: input.lastRaiseDate ?? getTodayInNewYorkString(),
      }
    : input;
  const ok = await store.update(id, finalInput);
  return ok ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}
export function deleteFieldWorkerRate(id: string) {
  void store.remove(id);
}
