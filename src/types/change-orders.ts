import type { BaseEntity } from "@/types/common";

/**
 * Change Orders — scope/cost changes discovered or requested after an
 * estimate becomes the working budget for a property. Approved change
 * orders add to (or subtract from) the original estimate to produce the
 * "Revised Budget" used everywhere in Cost Tracking and Portfolio Rollup.
 */
export type ChangeOrderStatus = "pending" | "approved" | "rejected";

export interface ChangeOrder extends BaseEntity {
  projectId: string;
  estimateId: string;
  changeOrderNumber: string;
  description: string;
  reason?: string;
  /** Positive = adds to budget, negative = a deduction. */
  costImpact: number;
  scheduleImpactDays?: number;
  /** Which estimate line item this change relates to (e.g. "Roofing") — picked from the estimate, or typed manually. */
  relatedItem?: string;
  changeOrderStatus: ChangeOrderStatus;
  requestedBy?: string;
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  notes?: string;
}
