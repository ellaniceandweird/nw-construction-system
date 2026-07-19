import type { Activity } from "@/types/scheduling";

/**
 * Automated Material Forecast Detection.
 *
 * The Master Schedule's `Activity.requiredMaterials` field (SDS §6.4) is
 * where real per-activity material lists belong — but the source workbook
 * never populated it for any activity. Until that data entry happens,
 * this detector fills the gap: it scans each activity's name/description/
 * WBS path for construction-trade keywords and maps matches to a small
 * material dictionary. It's a deterministic, rule-based classifier (the
 * same kind of derived indicator the app already surfaces as "AI" on the
 * 16-week lookahead's risk flags) — not a live model call.
 *
 * Once real requiredMaterials data (or real Estimating takeoffs) exists,
 * prefer that over the keyword match — see resolveQuantity() below.
 */

export interface MaterialRule {
  key: string;
  label: string;
  unit: string;
  /** Illustrative per-activity quantity used only when no takeoff quantity exists for this project+material. */
  defaultQuantity: number;
  vendorCategory: string;
  matchers: RegExp[];
}

export const MATERIAL_RULES: MaterialRule[] = [
  {
    key: "cedar-siding",
    label: "Cedar / board siding",
    unit: "sf",
    defaultQuantity: 250,
    vendorCategory: "Lumber & Framing",
    matchers: [/siding/i, /sheathing/i, /housewrap/i, /batten/i],
  },
  {
    key: "windows",
    label: "Windows",
    unit: "each",
    defaultQuantity: 4,
    vendorCategory: "Windows & Doors",
    matchers: [/window/i],
  },
  {
    key: "roofing",
    label: "Roofing materials",
    unit: "sq",
    defaultQuantity: 10,
    vendorCategory: "Roofing Materials",
    matchers: [/\broof/i],
  },
  {
    key: "masonry",
    label: "Masonry / mortar",
    unit: "cy",
    defaultQuantity: 2,
    vendorCategory: "Concrete & Masonry",
    matchers: [/brick/i, /masonry/i, /mortar/i],
  },
  {
    key: "rebar-concrete",
    label: "Rebar & concrete",
    unit: "pieces",
    defaultQuantity: 30,
    vendorCategory: "Concrete & Masonry",
    matchers: [/bulkhead/i, /concrete/i, /foundation/i],
  },
  {
    key: "paint-stain",
    label: "Paint & stain",
    unit: "gallons",
    defaultQuantity: 5,
    vendorCategory: "Paint & Finishes",
    matchers: [/paint/i, /stain/i],
  },
  {
    key: "decking-lumber",
    label: "Decking lumber",
    unit: "lf",
    defaultQuantity: 100,
    vendorCategory: "Lumber & Framing",
    matchers: [/\bdeck/i],
  },
  {
    key: "trim-fascia",
    label: "Trim, fascia & soffit boards",
    unit: "lf",
    defaultQuantity: 80,
    vendorCategory: "Lumber & Framing",
    matchers: [/trim/i, /fascia/i, /soffit/i],
  },
  {
    key: "fencing",
    label: "Fencing & gate hardware",
    unit: "lf",
    defaultQuantity: 40,
    vendorCategory: "General Hardware",
    matchers: [/fence/i, /gate/i, /archway/i],
  },
];

export interface DetectedMaterial {
  activityId: string;
  materialKey: string;
  label: string;
  unit: string;
  defaultQuantity: number;
  vendorCategory: string;
}

/** Scans one activity's text fields against the keyword dictionary. */
export function detectMaterialsForActivity(activity: Activity): DetectedMaterial[] {
  const haystack = `${activity.name} ${activity.description ?? ""} ${activity.wbsPath}`;
  const matches: DetectedMaterial[] = [];
  for (const rule of MATERIAL_RULES) {
    if (rule.matchers.some((re) => re.test(haystack))) {
      matches.push({
        activityId: activity.id,
        materialKey: rule.key,
        label: rule.label,
        unit: rule.unit,
        defaultQuantity: rule.defaultQuantity,
        vendorCategory: rule.vendorCategory,
      });
    }
  }
  return matches;
}

const OPEN_STATUSES: Activity["status"][] = [
  "not_started",
  "ready",
  "in_progress",
  "delayed",
  "blocked",
];

/** Only forecast materials for work that hasn't finished yet. */
export function isOpenActivity(activity: Activity): boolean {
  return OPEN_STATUSES.includes(activity.status);
}
