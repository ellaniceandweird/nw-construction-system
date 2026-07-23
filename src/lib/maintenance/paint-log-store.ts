"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import type { PaintLogEntry } from "@/types/maintenance";

function fromRow(row: Record<string, any>): PaintLogEntry {
  return {
    id: row.id,
    propertyId: row.property_id ?? undefined,
    propertyName: row.property_name,
    location: row.location,
    brand: row.brand ?? undefined,
    colorName: row.color_name ?? undefined,
    colorCode: row.color_code ?? undefined,
    sheen: row.sheen ?? undefined,
    dateApplied: row.date_applied ?? undefined,
    notes: row.notes ?? undefined,
    createdBy: row.created_by ?? "system",
    createdDate: row.created_date ?? new Date().toISOString(),
    lastModifiedBy: row.last_modified_by ?? "system",
    lastModifiedDate: row.last_modified_date ?? new Date().toISOString(),
    revisionNumber: row.revision_number ?? 1,
    module: "Maintenance",
    status: row.status ?? "active",
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.propertyId !== undefined) row.property_id = input.propertyId;
  if (input.propertyName !== undefined) row.property_name = input.propertyName;
  if (input.location !== undefined) row.location = input.location;
  if (input.brand !== undefined) row.brand = input.brand;
  if (input.colorName !== undefined) row.color_name = input.colorName;
  if (input.colorCode !== undefined) row.color_code = input.colorCode;
  if (input.sheen !== undefined) row.sheen = input.sheen;
  if (input.dateApplied !== undefined) row.date_applied = input.dateApplied;
  if (input.notes !== undefined) row.notes = input.notes;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<PaintLogEntry>({
  table: "paint_log",
  seedData: [],
  fromRow,
  toRow,
  orderBy: "property_name",
});

export const subscribePaintLog = store.subscribe;
export const getPaintLogSnapshot = store.getSnapshot;

export interface PaintLogInput {
  propertyId?: string;
  propertyName: string;
  location: string;
  brand?: string;
  colorName?: string;
  colorCode?: string;
  sheen?: string;
  dateApplied?: string;
  notes?: string;
}

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, e) => {
    const n = parseInt(e.id.replace("PAINT-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `PAINT-${String(maxNum + 1).padStart(6, "0")}`;
}

export function createPaintLogEntry(input: PaintLogInput) {
  const id = nextId();
  void store.create({ id, ...input });
  return id;
}
export function updatePaintLogEntry(id: string, input: PaintLogInput) {
  void store.update(id, input);
}
export function deletePaintLogEntry(id: string) {
  void store.remove(id);
}
