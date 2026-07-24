"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_DRAWINGS } from "@/lib/data/mock/drawings";
import type { Drawing, DrawingDiscipline, DocumentStatus } from "@/types/documents";

function fromRow(row: Record<string, any>): Drawing {
  return {
    id: row.id,
    projectId: row.project_id,
    projectName: row.project_name ?? undefined,
    propertyId: row.property_id ?? undefined,
    propertyName: row.property_name ?? undefined,
    drawingNumber: row.drawing_number,
    drawingTitle: row.drawing_title,
    discipline: row.discipline,
    sheetNumber: row.sheet_number ?? undefined,
    revision: row.revision,
    scale: row.scale ?? undefined,
    issueDate: row.issue_date,
    currentRevisionUrl: row.current_revision_url,
    previousRevisionUrls: row.previous_revision_urls ?? undefined,
    drawingStatus: row.drawing_status,
    drawingType: row.drawing_type ?? undefined,
    architect: row.architect ?? undefined,
    engineer: row.engineer ?? undefined,
    uploadedBy: row.uploaded_by ?? "",
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
  if (input.drawingNumber !== undefined) row.drawing_number = input.drawingNumber;
  if (input.drawingTitle !== undefined) row.drawing_title = input.drawingTitle;
  if (input.discipline !== undefined) row.discipline = input.discipline;
  if (input.sheetNumber !== undefined) row.sheet_number = input.sheetNumber;
  if (input.revision !== undefined) row.revision = input.revision;
  if (input.scale !== undefined) row.scale = input.scale;
  if (input.issueDate !== undefined) row.issue_date = input.issueDate;
  if (input.currentRevisionUrl !== undefined) row.current_revision_url = input.currentRevisionUrl;
  if (input.previousRevisionUrls !== undefined) row.previous_revision_urls = input.previousRevisionUrls;
  if (input.drawingStatus !== undefined) row.drawing_status = input.drawingStatus;
  if (input.architect !== undefined) row.architect = input.architect;
  if (input.engineer !== undefined) row.engineer = input.engineer;
  if (input.uploadedBy !== undefined) row.uploaded_by = input.uploadedBy;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<Drawing>({
  table: "drawings",
  seedData: MOCK_DRAWINGS,
  fromRow,
  toRow,
  orderBy: "issue_date",
});

export const subscribeDrawings = store.subscribe;
export const getDrawingsSnapshot = store.getSnapshot;

export interface DrawingInput {
  projectId: string;
  projectName?: string;
  propertyId?: string;
  propertyName?: string;
  drawingNumber: string;
  drawingTitle: string;
  discipline: DrawingDiscipline;
  sheetNumber?: string;
  revision: string;
  scale?: string;
  issueDate: string;
  currentRevisionUrl: string;
  drawingStatus: DocumentStatus;
  architect?: string;
  engineer?: string;
  uploadedBy: string;
}

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, d) => {
    const n = parseInt(d.id.replace("DWG-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `DWG-${String(maxNum + 1).padStart(6, "0")}`;
}

export function createDrawing(input: DrawingInput) {
  const id = nextId();
  void store.create({ id, ...input });
  return id;
}

export function updateDrawing(id: string, input: DrawingInput) {
  const existing = store.getSnapshot().find((d) => d.id === id);
  const previousRevisionUrls =
    existing && existing.revision !== input.revision
      ? [...(existing.previousRevisionUrls ?? []), existing.currentRevisionUrl]
      : existing?.previousRevisionUrls;
  void store.update(id, { ...input, previousRevisionUrls });
}

export function deleteDrawing(id: string) {
  void store.remove(id);
}
