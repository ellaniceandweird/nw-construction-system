"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import type { PaintLogEntry } from "@/types/maintenance";

function fromRow(row: Record<string, any>): PaintLogEntry {
  return {
    id: row.id,
    propertyId: row.property_id ?? undefined,
    propertyName: row.property_name,
    propertyAddress: row.property_address ?? undefined,
    location: row.location,
    location2: row.location2 ?? undefined,
    brand: row.brand ?? undefined,
    productType: row.product_type ?? undefined,
    finish: row.finish ?? undefined,
    color: row.color ?? undefined,
    colorCode: row.color_code ?? undefined,
    comments: row.comments ?? undefined,
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
  if (input.propertyAddress !== undefined) row.property_address = input.propertyAddress;
  if (input.location !== undefined) row.location = input.location;
  if (input.location2 !== undefined) row.location2 = input.location2;
  if (input.brand !== undefined) row.brand = input.brand;
  if (input.productType !== undefined) row.product_type = input.productType;
  if (input.finish !== undefined) row.finish = input.finish;
  if (input.color !== undefined) row.color = input.color;
  if (input.colorCode !== undefined) row.color_code = input.colorCode;
  if (input.comments !== undefined) row.comments = input.comments;
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
  propertyAddress?: string;
  location: string;
  location2?: string;
  brand?: string;
  productType?: string;
  finish?: string;
  color?: string;
  colorCode?: string;
  comments?: string;
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
