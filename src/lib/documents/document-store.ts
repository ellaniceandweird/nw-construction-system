"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_DOCUMENTS } from "@/lib/data/mock/documents";
import type { ProjectDocument, DocumentCategory, DocumentStatus } from "@/types/documents";

function fromRow(row: Record<string, any>): ProjectDocument {
  return {
    id: row.id,
    projectId: row.project_id,
    projectName: row.project_name ?? undefined,
    propertyId: row.property_id ?? undefined,
    propertyName: row.property_name ?? undefined,
    documentNumber: row.document_number,
    title: row.title,
    category: row.category,
    subcategory: row.subcategory ?? undefined,
    revision: row.revision,
    version: row.version ?? undefined,
    documentStatus: row.document_status,
    author: row.author ?? undefined,
    reviewer: row.reviewer ?? undefined,
    approver: row.approver ?? undefined,
    issueDate: row.issue_date ?? undefined,
    effectiveDate: row.effective_date ?? undefined,
    expirationDate: row.expiration_date ?? undefined,
    fileType: row.file_type,
    fileUrl: row.file_url,
    fileSizeBytes: row.file_size_bytes ?? undefined,
    keywords: row.keywords ?? undefined,
    tags: row.tags ?? undefined,
    relatedActivityId: row.related_activity_id ?? undefined,
    relatedCostCode: row.related_cost_code ?? undefined,
    relatedVendorId: row.related_vendor_id ?? undefined,
    comments: row.comments ?? undefined,
    createdBy: row.created_by ?? "system",
    createdDate: row.created_date ?? new Date().toISOString(),
    lastModifiedBy: row.last_modified_by ?? "system",
    lastModifiedDate: row.last_modified_date ?? new Date().toISOString(),
    revisionNumber: row.revision_number ?? 1,
    module: "Documents",
    status: row.status ?? "active",
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.projectId !== undefined) row.project_id = input.projectId;
  if (input.projectName !== undefined) row.project_name = input.projectName;
  if (input.propertyId !== undefined) row.property_id = input.propertyId;
  if (input.propertyName !== undefined) row.property_name = input.propertyName;
  if (input.documentNumber !== undefined) row.document_number = input.documentNumber;
  if (input.title !== undefined) row.title = input.title;
  if (input.category !== undefined) row.category = input.category;
  if (input.revision !== undefined) row.revision = input.revision;
  if (input.documentStatus !== undefined) row.document_status = input.documentStatus;
  if (input.author !== undefined) row.author = input.author;
  if (input.issueDate !== undefined) row.issue_date = input.issueDate;
  if (input.fileType !== undefined) row.file_type = input.fileType;
  if (input.fileUrl !== undefined) row.file_url = input.fileUrl;
  if (input.tags !== undefined) row.tags = input.tags;
  if (input.comments !== undefined) row.comments = input.comments;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<ProjectDocument>({
  table: "documents",
  seedData: MOCK_DOCUMENTS,
  fromRow,
  toRow,
  orderBy: "issue_date",
});

export const subscribeDocuments = store.subscribe;
export const getDocumentsSnapshot = store.getSnapshot;

export interface DocumentInput {
  projectId: string;
  projectName?: string;
  propertyId?: string;
  propertyName?: string;
  title: string;
  category: DocumentCategory;
  revision: string;
  documentStatus: DocumentStatus;
  author?: string;
  issueDate?: string;
  fileType: string;
  fileUrl: string;
  tags?: string[];
  comments?: string;
}

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, d) => {
    const n = parseInt(d.id.replace("DOC-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `DOC-${String(maxNum + 1).padStart(6, "0")}`;
}

function nextNumber(): string {
  const year = new Date().getFullYear();
  const items = store.getSnapshot();
  return `DOC-${year}-${String(items.length + 1).padStart(4, "0")}`;
}

export function createDocument(input: DocumentInput) {
  const id = nextId();
  void store.create({ id, documentNumber: nextNumber(), ...input });
  return id;
}
export function updateDocument(id: string, input: DocumentInput) {
  void store.update(id, input);
}
export function deleteDocument(id: string) {
  void store.remove(id);
}
export function restoreDocument(doc: ProjectDocument) {
  void store.create(doc);
}
