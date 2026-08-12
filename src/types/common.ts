/**
 * Shared types used across every module.
 * Source: SDS Volume 3 §2.4 (Standard Record Status) and §2.5 (Standard
 * Metadata) — every record in Project NW carries this base shape.
 */

/** SDS §2.4 — Standard Record Status, available on every record type. */
export type RecordStatus =
  | "draft"
  | "pending"
  | "active"
  | "completed"
  | "cancelled"
  | "archived"
  | "deleted"
  | "locked"
  | "approved"
  | "rejected";

/**
 * SDS §2.5 — Standard Metadata.
 * Every record created in Project NW automatically carries these fields.
 * Domain interfaces extend this instead of repeating it.
 */
export interface BaseEntity {
  id: string; // e.g. "PRJ-000001" — see Volume 9 §4 Identifier Format
  createdBy: string;
  createdDate: string; // ISO 8601
  lastModifiedBy: string;
  lastModifiedDate: string; // ISO 8601
  revisionNumber: number;
  module: string;
  projectId?: string; // omitted for entities that ARE the project itself
  status: RecordStatus;
  auditId?: string;
}

/** A generic file/photo attachment reused by Projects, Documents, Daily Logs, etc. */
export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  version: number;
  uploadedBy: string;
  uploadDate: string;
  revisionNumber: number;
  description?: string;
}

/** A single entry in any module's activity/audit timeline (SDS §5.12, §5.18). */
export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  eventType: string;
  description: string;
  relatedRecordId?: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
}

/** Common priority scale reused across MRs, RFIs, activities, notifications. */
export type Priority = "low" | "medium" | "high" | "critical";
