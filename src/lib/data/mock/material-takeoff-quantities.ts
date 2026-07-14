/**
 * ILLUSTRATIVE Estimating takeoff quantities, keyed by project + material.
 *
 * The Estimating module itself is still a placeholder (Phase — not yet
 * built), so there's no real quantity-takeoff data to pull from yet. This
 * small illustrative table stands in for "the quantity you'd see in
 * Estimating" so the Forecast tab has something more specific than a flat
 * per-activity guess. Once real Estimating takeoffs exist, wire the
 * Forecast detector to read TakeoffItem[] instead of this file — the
 * lookup shape (projectId + materialKey -> quantity/unit) stays the same.
 */
export interface TakeoffQuantity {
  projectId: string;
  materialKey: string;
  quantity: number;
  unit: string;
}

export const MOCK_TAKEOFF_QUANTITIES: TakeoffQuantity[] = [
  { projectId: "PRJ-000006", materialKey: "cedar-siding", quantity: 1800, unit: "sf" },
  { projectId: "PRJ-000006", materialKey: "windows", quantity: 6, unit: "each" },
  { projectId: "PRJ-000006", materialKey: "trim-fascia", quantity: 220, unit: "lf" },
  { projectId: "PRJ-000006", materialKey: "paint-stain", quantity: 18, unit: "gallons" },
  { projectId: "PRJ-000010", materialKey: "rebar-concrete", quantity: 40, unit: "pieces" },
  { projectId: "PRJ-000011", materialKey: "roofing", quantity: 32, unit: "sq" },
  { projectId: "PRJ-000015", materialKey: "roofing", quantity: 14, unit: "sq" },
];
