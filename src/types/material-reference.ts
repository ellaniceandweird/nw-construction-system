import type { BaseEntity } from "@/types/common";

/** A reference catalog entry for a material — spec sheet, preferred vendor, category — kept separate from Cost Database (which is about pricing) and separate from Takeoff (which is about quantities on a specific job). */
export interface MaterialReference extends BaseEntity {
  materialName: string;
  category?: string;
  specification?: string;
  preferredVendor?: string;
  referenceUrl?: string;
  notes?: string;
}
