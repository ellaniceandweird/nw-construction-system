"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_TAKEOFF_ITEMS } from "@/lib/data/mock/takeoff-items";
import type { TakeoffItem } from "@/types/estimating";

function fromRow(row: Record<string, any>): TakeoffItem {
  return {
    id: row.id,
    projectId: row.project_id,
    drawingReference: row.drawing_reference ?? undefined,
    revision: row.revision ?? undefined,
    location: row.location ?? undefined,
    csiDivision: row.csi_division ?? undefined,
    costCode: row.cost_code ?? undefined,
    description: row.description,
    measurementType: row.measurement_type,
    unit: row.unit,
    quantity: Number(row.quantity ?? 0),
    wasteFactorPercent: row.waste_factor_percent != null ? Number(row.waste_factor_percent) : undefined,
    adjustedQuantity: Number(row.adjusted_quantity ?? row.quantity ?? 0),
    measuredBy: row.measured_by ?? undefined,
    checkedBy: row.checked_by ?? undefined,
    materialKey: row.material_key ?? undefined,
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.projectId !== undefined) row.project_id = input.projectId;
  if (input.drawingReference !== undefined) row.drawing_reference = input.drawingReference;
  if (input.revision !== undefined) row.revision = input.revision;
  if (input.location !== undefined) row.location = input.location;
  if (input.csiDivision !== undefined) row.csi_division = input.csiDivision;
  if (input.costCode !== undefined) row.cost_code = input.costCode;
  if (input.description !== undefined) row.description = input.description;
  if (input.measurementType !== undefined) row.measurement_type = input.measurementType;
  if (input.unit !== undefined) row.unit = input.unit;
  if (input.quantity !== undefined) row.quantity = input.quantity;
  if (input.wasteFactorPercent !== undefined) row.waste_factor_percent = input.wasteFactorPercent;
  if (input.adjustedQuantity !== undefined) row.adjusted_quantity = input.adjustedQuantity;
  if (input.measuredBy !== undefined) row.measured_by = input.measuredBy;
  if (input.checkedBy !== undefined) row.checked_by = input.checkedBy;
  if (input.materialKey !== undefined) row.material_key = input.materialKey;
  return row;
}

const store = createCollectionStore<TakeoffItem>({
  table: "takeoff_items",
  seedData: MOCK_TAKEOFF_ITEMS,
  fromRow,
  toRow,
  orderBy: "id",
});

export const subscribeTakeoffItems = store.subscribe;
export const getTakeoffItemsSnapshot = store.getSnapshot;

function computeAdjusted(quantity: number, wasteFactorPercent?: number) {
  return wasteFactorPercent ? Math.round(quantity * (1 + wasteFactorPercent / 100)) : quantity;
}

export type TakeoffItemInput = Omit<TakeoffItem, "id" | "adjustedQuantity">;

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, t) => {
    const n = parseInt(t.id.replace("TO-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `TO-${String(maxNum + 1).padStart(6, "0")}`;
}

export async function createTakeoffItem(input: TakeoffItemInput): Promise<{ ok: boolean; error?: string }> {
  const id = nextId();
  const result = await store.create({
    id,
    adjustedQuantity: computeAdjusted(input.quantity, input.wasteFactorPercent),
    ...input,
  });
  return result !== null ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}

export async function updateTakeoffItem(id: string, input: TakeoffItemInput): Promise<{ ok: boolean; error?: string }> {
  const ok = await store.update(id, {
    ...input,
    adjustedQuantity: computeAdjusted(input.quantity, input.wasteFactorPercent),
  });
  return ok ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}

export function deleteTakeoffItem(id: string) {
  void store.remove(id);
}
