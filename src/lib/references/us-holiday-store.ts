"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_US_HOLIDAYS } from "@/lib/data/mock/us-holidays";
import type { USHoliday } from "@/types/references";

function fromRow(row: Record<string, any>): USHoliday {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
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
  if (input.name !== undefined) row.name = input.name;
  if (input.date !== undefined) row.date = input.date;
  if (input.notes !== undefined) row.notes = input.notes;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<USHoliday>({
  table: "us_holidays",
  seedData: MOCK_US_HOLIDAYS,
  fromRow,
  toRow,
  orderBy: "date",
});

export const subscribeUSHolidays = store.subscribe;
export const getUSHolidaysSnapshot = store.getSnapshot;

export interface USHolidayInput {
  name: string;
  date: string;
  notes?: string;
}

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, h) => {
    const n = parseInt(h.id.replace("HOL-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `HOL-${String(maxNum + 1).padStart(6, "0")}`;
}

export function createUSHoliday(input: USHolidayInput) {
  const id = nextId();
  void store.create({ id, ...input });
  return id;
}
export function updateUSHoliday(id: string, input: USHolidayInput) {
  void store.update(id, input);
}
export function deleteUSHoliday(id: string) {
  void store.remove(id);
}
