import type { BaseEntity } from "@/types/common";

/**
 * Document Management Module data models.
 * Source: SDS Volume 3 §11 — Document Categories (§11.4), Document
 * Metadata (§11.6), Version Control (§11.7), Drawing Management (§11.9),
 * RFI Management (§11.11), Submittal Management (§11.12), Meeting Minutes
 * (§11.13), Photo Management (§11.14).
 */

export type DocumentCategory =
  // Design documents
  | "architectural_drawing"
  | "structural_drawing"
  | "civil_drawing"
  | "mechanical_drawing"
  | "electrical_drawing"
  | "plumbing_drawing"
  | "shop_drawing"
  | "as_built_drawing"
  // Technical documents
  | "specification"
  | "product_data"
  | "installation_manual"
  | "material_certification"
  | "test_report"
  // Construction documents
  | "rfi"
  | "submittal"
  | "daily_report"
  | "inspection_report"
  | "safety_report"
  | "quality_report"
  // Commercial documents
  | "contract"
  | "master_subcontract_agreement"
  | "purchase_order"
  | "quotation"
  | "change_order"
  | "invoice"
  // Closeout documents
  | "punch_list"
  | "warranty_certificate"
  | "commissioning_report"
  | "operation_manual"
  | "maintenance_manual"
  | "final_acceptance";

export type DocumentStatus =
  | "draft"
  | "internal_review"
  | "owner_review"
  | "approved"
  | "approved_with_comments"
  | "rejected"
  | "superseded"
  | "archived"
  | "expired";

/** SDS §11.6 — Document Metadata (independent of the underlying file). */
export interface ProjectDocument extends BaseEntity {
  projectId: string;
  projectName?: string; // set when projectId is the manual-entry sentinel
  propertyId?: string;
  propertyName?: string; // set when propertyId is the manual-entry sentinel, or resolved for display
  documentNumber: string;
  title: string;
  category: DocumentCategory;
  subcategory?: string;
  revision: string; // "0", "1", "A", "B" — SDS §11.7 supports both schemes
  version?: string; // "v1.0", "v1.1"
  documentStatus: DocumentStatus;
  author?: string;
  reviewer?: string;
  approver?: string;
  issueDate?: string;
  effectiveDate?: string;
  expirationDate?: string;
  fileType: string;
  fileUrl: string;
  fileSizeBytes?: number;
  keywords?: string[];
  tags?: string[];
  relatedActivityId?: string;
  relatedCostCode?: string;
  relatedVendorId?: string;
  relatedRfiId?: string;
  relatedSubmittalId?: string;
  comments?: string;
}

export type DrawingDiscipline =
  | "architectural"
  | "structural"
  | "civil"
  | "mechanical"
  | "electrical"
  | "plumbing"
  | "fire_protection"
  | "landscape"
  | "interior_design"
  | "survey";

/** SDS §11.9 — Drawing Management (drawings get their own record type). */
export interface Drawing extends BaseEntity {
  projectId: string;
  drawingNumber: string;
  drawingTitle: string;
  discipline: DrawingDiscipline;
  sheetNumber?: string;
  revision: string;
  scale?: string;
  issueDate: string;
  currentRevisionUrl: string;
  previousRevisionUrls?: string[];
  drawingStatus: DocumentStatus;
  drawingType?: string;
  architect?: string;
  engineer?: string;
  uploadedBy: string;
  associatedSpecificationId?: string;
  associatedActivityIds?: string[];
}

export type RfiStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "answered"
  | "closed"
  | "cancelled";

/** SDS §11.11 — RFI Management. */
export interface RFI extends BaseEntity {
  projectId: string;
  rfiNumber: string;
  subject: string;
  category?: string;
  description: string;
  question: string;
  requestedBy: string;
  assignedTo?: string;
  priority: "low" | "medium" | "high" | "critical";
  dateSubmitted: string;
  requiredResponseDate: string;
  actualResponseDate?: string;
  rfiStatus: RfiStatus;
  answer?: string;
  relatedDrawingIds?: string[];
  relatedActivityIds?: string[];
  relatedPhotoIds?: string[];
}

export type SubmittalStatus =
  | "pending"
  | "submitted"
  | "approved"
  | "approved_as_noted"
  | "revise_and_resubmit"
  | "rejected"
  | "closed";

/** SDS §11.12 — Submittal Management. */
export interface Submittal extends BaseEntity {
  projectId: string;
  submittalNumber: string;
  specificationSection?: string;
  material?: string;
  manufacturer?: string;
  vendorId?: string;
  submittedBy: string;
  reviewer?: string;
  architect?: string;
  submissionDate: string;
  requiredDate?: string;
  returnedDate?: string;
  submittalStatus: SubmittalStatus;
  revision?: string;
  comments?: string;
}

export type MeetingType =
  | "internal_coordination"
  | "client_meeting"
  | "site_walk"
  | "procurement_meeting"
  | "safety_meeting"
  | "design_coordination"
  | "progress_meeting";

/** SDS §11.13 — Meeting Minutes. */
export interface MeetingMinutes extends BaseEntity {
  projectId: string;
  meetingType: MeetingType;
  date: string;
  location?: string;
  attendees: string[];
  agenda?: string;
  discussionItems?: string;
  actionItems: Array<{
    description: string;
    responsiblePerson: string;
    dueDate?: string;
    status: "open" | "in_progress" | "closed";
  }>;
}

export type ProjectPhotoCategory =
  | "existing_conditions"
  | "progress"
  | "safety"
  | "quality"
  | "material_delivery"
  | "defects"
  | "completed_work"
  | "punch_list"
  | "warranty";

/** SDS §11.14 — Photo Management (document-library view; field capture lives in field-operations.ts). */
export interface ProjectPhotoAlbumEntry {
  photoId: string;
  album?: string;
  date: string;
  projectId: string;
  location?: string;
  activityId?: string;
  photographer?: string;
  description?: string;
  tags?: string[];
  category: ProjectPhotoCategory;
  relatedDailyLogId?: string;
  relatedInspectionId?: string;
  relatedRfiId?: string;
  relatedSubmittalId?: string;
}
