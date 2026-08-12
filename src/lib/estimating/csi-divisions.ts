/**
 * Standard CSI MasterFormat division names, keyed by the first two digits
 * of a cost code (works for both 5-digit "07040" and 6-digit "074600"
 * style codes). Used to group estimate line items into the same
 * division-by-division layout as a traditional budget sheet.
 */
const DIVISION_NAMES: Record<string, string> = {
  "00": "Soft Costs",
  "01": "General Conditions",
  "02": "Site Work",
  "03": "Concrete",
  "04": "Masonry",
  "05": "Metals",
  "06": "Wood and Plastics",
  "07": "Thermal and Moisture Protection",
  "08": "Doors and Windows",
  "09": "Finishes",
  "10": "Specialties",
  "11": "Equipment",
  "12": "Furnishings",
  "13": "Special Construction",
  "14": "Conveying Systems",
  "15": "Mechanical",
  "16": "Electrical",
  "22": "Plumbing",
  "23": "HVAC",
  "26": "Electrical",
  "32": "Exterior Improvements",
};

export function getDivisionLabel(costCode?: string): string {
  if (!costCode || costCode.length < 2) return "Uncoded";
  const prefix = costCode.slice(0, 2);
  const name = DIVISION_NAMES[prefix];
  return name ? `${prefix} — ${name}` : `Division ${prefix}`;
}

/** Sort key so divisions appear in standard CSI order rather than alphabetically. */
export function getDivisionSortKey(costCode?: string): string {
  if (!costCode || costCode.length < 2) return "99";
  return costCode.slice(0, 2);
}
