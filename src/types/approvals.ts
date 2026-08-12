import type { BaseEntity } from "@/types/common";

export type ApprovalKind = "budget" | "estimate" | "purchase_order" | "change_order" | "material_request" | "manual";
export type ApproverName = "Sjaak" | "Carlo" | "Ben";
export type ApprovalRequestStatus = "pending" | "approved" | "rejected";

export const ALL_APPROVERS: ApproverName[] = ["Sjaak", "Carlo", "Ben"];

/**
 * Tracks who has actually signed off on something — separate from the
 * source record's own single "approvedBy" field, since a Budget or
 * Change Order needs Sjaak AND Carlo AND Ben to all individually sign
 * off, not just one of them. For items linked to a real source record
 * (kind !== "manual"), this row is auto-created the first time that
 * record enters a pending-approval state, and is a live tracking
 * layer — not the record itself. For kind === "manual", this row IS
 * the whole record.
 */
export interface ApprovalRequest extends BaseEntity {
  kind: ApprovalKind;
  /** The id of the Budget/Estimate/ChangeOrder/PurchaseOrder this tracks — undefined for manual entries. */
  sourceId?: string;
  title: string;
  projectName: string;
  amount: number;
  requestedBy: string;
  requestedDate: string;
  /** Who actually needs to sign off on this one, per the approval rules or a manual override. */
  requiredApprovers: ApproverName[];
  sjaakApprovedDate?: string;
  carloApprovedDate?: string;
  benApprovedDate?: string;
  approvalStatus: ApprovalRequestStatus;
  notes?: string;
}
